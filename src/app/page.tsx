import { listWorkflows } from "@/lib/intake/workflows";
import { IntakeDemo } from "./ui/intake-demo";

export default function Home() {
  return <IntakeDemo workflows={listWorkflows()} />;
}
