import { AppleLogo, GoogleG } from "@/Components/ui/BrandIcons";

// "or continue with" + Google / Apple, shared by log-in and sign-up. onPick(provider) starts the sign-in.
function SocialButtons({ onPick }) {
  return (
    <>
      <div className="ab-auth__or" role="separator">
        <span>or continue with</span>
      </div>

      <div className="ab-auth__social">
        <button
          type="button"
          className="ab-social ab-social--google"
          aria-label="Continue with Google"
          onClick={() => onPick("google")}
        >
          <GoogleG size={18} />
          Google
        </button>
        <button
          type="button"
          className="ab-social ab-social--apple"
          aria-label="Continue with Apple"
          onClick={() => onPick("apple")}
        >
          <AppleLogo size={18} />
          Apple
        </button>
      </div>
    </>
  );
}

export default SocialButtons;
