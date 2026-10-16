import NavProgress from "@/Components/NavProgress";
import FieldA11y from "@/Components/ui/FieldA11y";
import AuthProvider from "@/Components/Provider/AuthProvider";
import PaymenyProvider from "@/Components/Provider/PaymenyProvider";
import { MotionRuntime } from "@/Components/ui/Motion";
import { Schibsted_Grotesk } from "next/font/google";
import { Slide, ToastContainer } from "react-toastify";
import "../../public/assets/css/plugins.css";
import "./globals.css";
import "./ds.css";

// Schibsted Grotesk for everything:
// firm, slightly editorial grotesk — reads as a trustworthy local brand, not a template.
const text = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-text",
});

export const metadata = {
  title: "Any-Buddy — Service for Everybody",
  description:
    "Any-Buddy connects Massachusetts homeowners with local home service pros our team has approved. Book in minutes.",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: browser extensions (grammar checkers, colour pickers) add their own attributes to
    // <html>/<body> before React loads. Only these two tags' attributes are ignored; mismatches inside still warn.
    // data-scroll-behavior belongs on <html> (Next.js reads it there to keep smooth scrolling off during route changes).
    <html lang="en" className={text.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#main" className="ab-skip">
          Skip to content
        </a>
        <NavProgress />
        <FieldA11y />
        <MotionRuntime />
        <AuthProvider>
          <PaymenyProvider>{children}</PaymenyProvider>
        </AuthProvider>
        {/* Toasts in the site design (styles in ds.css): white card, small coloured icon, gentle slide, no progress bar. */}
        <ToastContainer
          position="top-center"
          autoClose={3500}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          transition={Slide}
          theme="light"
        />
      </body>
    </html>
  );
}
