import Provider from "@/Components/Provider/Provider";

function layout({ children }) {
  return (
    <>
      <Provider>{children}</Provider>
    </>
  );
}

export default layout;
