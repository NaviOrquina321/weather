import { Metadata, Viewport } from "next";
import "../../styles/global.css";

export const metadata: Metadata = {
  title: "shnxbucks — peace in every sip",
  description: "Promotional website and interactive Remotion video player for shnxbucks coffee.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen text-slate-800 antialiased selection:bg-slate-300">
        {children}
      </body>
    </html>
  );
}
