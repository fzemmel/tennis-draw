import { Analytics } from "@vercel/analytics/react";
import { TennisMixer } from "./components/TennisMixer/TennisMixer";

export default function App() {
  return (
    <>
      <TennisMixer />
      <Analytics debug={false} />
    </>
  );
}
