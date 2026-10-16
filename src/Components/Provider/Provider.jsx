"use client";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

// Pages shown inside the mobile apps get no header/footer: decided by app/(CommonPage)/layout.js, not here.
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
