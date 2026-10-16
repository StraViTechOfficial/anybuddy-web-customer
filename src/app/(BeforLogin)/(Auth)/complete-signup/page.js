"use client";
import AuthLayout from "@/Components/(Auth)/AuthLayout";

// The first Google or Apple sign-in. The customer adds a phone and accepts the Terms, then goes through the same
// code and address steps as an email sign-up.
function CompleteSignupPage() {
  return <AuthLayout page={"social"} />;
}

export default CompleteSignupPage;
