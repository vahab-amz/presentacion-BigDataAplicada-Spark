import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { OfflineSupport } from "@/components/deck/OfflineSupport";
import { THEME_STORAGE_KEY } from "@/lib/deck/types";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spark en tiempo real · Grupo 6",
  description:
    "Structured Streaming y MLlib: presentación del Grupo 6 (Vau y Onai) para Big Data Aplicado.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F17",
};

/** Applies the stored theme before first paint (no flash on weak projectors). */
const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${inter.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <OfflineSupport />
      </body>
    </html>
  );
}
