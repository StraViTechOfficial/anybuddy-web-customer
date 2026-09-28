import ResetChangePasswordForm from "@/Components/Forms/(AuthForm)/ResetChangePasswordForm";
import Icon from "@/Components/ui/Icon";

function ResetChangePassword(props) {
  return (
    <>
      <div className="ab-auth__head">
        <span className="ab-step-icon" aria-hidden="true">
          <Icon name="lock" size={26} />
        </span>
        <h1>Choose a new password</h1>
        <p>Use a password you haven&apos;t used on Any-Buddy before.</p>
      </div>
      <ResetChangePasswordForm page={props.page} />
    </>
  );
}

export default ResetChangePassword;
