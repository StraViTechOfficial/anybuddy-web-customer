import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  // Each sign-in is switched on only when its settings exist, so a site without them (e.g. staging) still builds.
  providers: [
    process.env.GOOGLE_CLIENT_ID &&
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),

    process.env.APPLE_PRIVATE_KEY &&
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: {
          appleId: process.env.APPLE_CLIENT_ID,
          teamId: process.env.APPLE_TEAM_ID,
          privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          keyId: process.env.APPLE_KEY_ID,
        },
      }),
  ].filter(Boolean),

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
        // SEC-06: the backend verifies this signed token; it no longer trusts bare IDs.
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
