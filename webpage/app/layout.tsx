import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(`https://halcyon-zhang.github.io${basePath || "/"}`),
  title: "DeepVoyager-VL — Vision-in-the-Loop Multimodal Search",
  description:
    "Incentivizing Vision-in-the-Loop Search for Long-Horizon Multimodal Agents.",
  openGraph: {
    title: "DeepVoyager-VL",
    description:
      "Incentivizing Vision-in-the-Loop Search for Long-Horizon Multimodal Agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
