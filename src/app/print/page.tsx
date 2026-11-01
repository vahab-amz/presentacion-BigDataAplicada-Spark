import type { Metadata } from "next";
import { PrintDeck } from "@/components/deck/PrintDeck";

export const metadata: Metadata = {
  title: "PDF · Spark en tiempo real · Grupo 6",
};

export default function PrintPage() {
  return <PrintDeck />;
}
