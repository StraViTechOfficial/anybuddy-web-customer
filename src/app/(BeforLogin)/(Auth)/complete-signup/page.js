"use client";
import AuthLayout from "@/Components/(Auth)/AuthLayout";

// First Google / Apple sign-in: phone + Terms, then the same code and address steps as email sign-up.
function CompleteSignupPage() {
  return <AuthLayout page={"social"} />;
}

export default CompleteSignupPage;
