import type { Metadata } from "next";
import { PresenterView } from "@/components/presenter/PresenterView";

export const metadata: Metadata = {
  title: "Presentador · Spark en tiempo real · Grupo 6",
};

export default function PresenterPage() {
  return <PresenterView />;
}
