import HomePage from "@/Components/HomePage";
import Provider from "@/Components/Provider/Provider";

export default function Home() {
  return (
    <>
      <Provider>
        <HomePage />
      </Provider>
    </>
  );
}
