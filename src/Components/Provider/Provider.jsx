"use client";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

// Pages shown inside the mobile apps get no header or footer. That is decided in app/(CommonPage)/layout.js, not here.
function Provider(props) {
  return (
    <>
      <Header />
      <main id="main" className="ab-main">
        {props.children}
      </main>
      <Footer />
    </>
  );
}

export default Provider;
