"use client";
import { usePathname } from "next/navigation";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

function Provider(props) {
  const pathname = usePathname();

  // Pages shown inside the mobile apps get no header/footer: decided by app/(CommonPage)/layout.js, not here.
  const disableHeaderFooterFor = [];

  // useEffect(() => {
  //   // Disable Right Click
  //   const disableRightClick = (e) => {
  //     e.preventDefault();
  //   };

  //   // Disable Specific Key Combinations
  //   const disableKeyDown = (e) => {
  //     const forbiddenKeys = [
  //       { keyCode: 123 }, // F12
  //       { keyCode: 73, ctrl: true, shift: true }, // Ctrl+Shift+I
  //       { keyCode: 74, ctrl: true, shift: true }, // Ctrl+Shift+J
  //       { keyCode: 67, ctrl: true, shift: true }, // Ctrl+Shift+C
  //       { keyCode: 85, ctrl: true }, // Ctrl+U
  //     ];

  //     const isForbidden = forbiddenKeys.some(
  //       (key) =>
  //         e.keyCode === key.keyCode &&
  //         (!key.ctrl || e.ctrlKey) &&
  //         (!key.shift || e.shiftKey)
  //     );

  //     if (isForbidden) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   };

  //   // Add Event Listeners
  //   document.addEventListener("contextmenu", disableRightClick);
  //   document.addEventListener("keydown", disableKeyDown);

  //   // Cleanup Event Listeners
  //   return () => {
  //     document.removeEventListener("contextmenu", disableRightClick);
  //     document.removeEventListener("keydown", disableKeyDown);
  //   };
  // }, []);

  return (
    <>
      {disableHeaderFooterFor?.includes(pathname) ? null : <Header />}
      <main id="main" className="ab-main">
        {props.children}
      </main>
      {disableHeaderFooterFor?.includes(pathname) ? null : <Footer />}
    </>
  );
}

export default Provider;
