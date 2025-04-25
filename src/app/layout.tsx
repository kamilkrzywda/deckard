import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deckard - AI MTG Deck Helper",
  description: "MTG Deck Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#212121] text-white flex justify-center items-center overflow-hidden">
        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
