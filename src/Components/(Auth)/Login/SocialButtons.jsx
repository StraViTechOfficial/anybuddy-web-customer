"use client";
import { AppleLogo, GoogleG } from "@/Components/ui/BrandIcons";
import { getProviders } from "next-auth/react";
import { useEffect, useState } from "react";

// "or continue with" + Google / Apple, shared by log-in and sign-up. onPick(provider) starts the sign-in. Only the
// providers the server has settings for show (route.js registers each one only when its env is present).
function SocialButtons({ onPick }) {
  const [on, setOn] = useState({});
  useEffect(() => {
    getProviders().then((p) => setOn(p || {})).catch(() => null);
  }, []);
  if (!on.google && !on.apple) return null;
  return (
    <>
      <div className="ab-auth__or" role="separator">
        <span>or continue with</span>
      </div>

      <div className="ab-auth__social">
        {on.google && <button
          type="button"
          className="ab-social ab-social--google"
          aria-label="Continue with Google"
          onClick={() => onPick("google")}
        >
          <GoogleG size={18} />
          Google
        </button>}
        {on.apple && <button
          type="button"
          className="ab-social ab-social--apple"
          aria-label="Continue with Apple"
          onClick={() => onPick("apple")}
        >
          <AppleLogo size={18} />
          Apple
        </button>}
      </div>
    </>
  );
}

export default SocialButtons;
