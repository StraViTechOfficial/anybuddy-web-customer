"use client";
import LoginForm from "@/Components/Forms/(AuthForm)/LoginForm";
import "@/Components/Forms/(AuthForm)/authfields.css";
import Icon from "@/Components/ui/Icon";
import Link from "next/link";

function ForgotPassword(props) {
  return (
    <>
      <div className="ab-auth__head">
        <span className="ab-step-icon" aria-hidden="true">
          <Icon name="lock" size={26} />
        </span>
        <h1>Reset your password</h1>
        <p>Enter the email address on your account and we&apos;ll send you a 6-digit code.</p>
      </div>
      <LoginForm page={props.page} />
      <p className="ab-auth__switch">
        <Link href={"/login"} className="ab-link">
          <Icon name="arrowLeft" size={18} />
          Back to log in
        </Link>
      </p>
    </>
  );
}

export default ForgotPassword;
