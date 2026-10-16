import crypto from "crypto";
import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";

// Apple's client secret is a JWT signed with the .p8 key (ES256), valid for at most 6 months. It is made here at
// start-up so nobody has to renew it by hand, since a serverless instance lives far less than the 180 days it is valid.
const appleSecret = () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const head = `${b64({ alg: "ES256", kid: process.env.APPLE_KEY_ID })}.${b64({
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 180 * 24 * 60 * 60,
    aud: "https://appleid.apple.com",
    sub: process.env.APPLE_ID,
  })}`;
  const key = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const sig = crypto.sign("sha256", Buffer.from(head), { key, dsaEncoding: "ieee-p1363" });
  return `${head}.${sig.toString("base64url")}`;
};

const appleOn = ["APPLE_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"].every((k) => process.env[k]);

// Apple returns with a cross-site POST (response_mode form_post), which never carries SameSite=Lax cookies. So the
// PKCE verifier and return page cookies must be SameSite=None, or the sign-in fails or lands on Home instead of /login.
const crossSite = { httpOnly: true, sameSite: "none", path: "/", secure: true };

const handler = NextAuth({
  // Each sign-in option is switched on only when its settings exist, so a site without them (such as staging) still builds.
  providers: [
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),

    appleOn && AppleProvider({ clientId: process.env.APPLE_ID, clientSecret: appleSecret() }),
  ].filter(Boolean),

  cookies: {
    pkceCodeVerifier: { name: "__Secure-next-auth.pkce.code_verifier", options: { ...crossSite, maxAge: 900 } },
    callbackUrl: { name: "__Secure-next-auth.callback-url", options: crossSite },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
        // The backend verifies this signed token, because it no longer trusts bare IDs.
        token.idToken = account.id_token;

        if (account.provider === "google") {
          token.googleId = profile?.sub;
        }

        if (account.provider === "apple") {
          token.appleId = account.providerAccountId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.provider = token.provider;
      session.user.providerId = token.providerId;
      session.user.googleId = token.googleId;
      session.user.appleId = token.appleId;
      session.user.idToken = token.idToken;

      return session;
    },
  },
});

export { handler as GET, handler as POST };
