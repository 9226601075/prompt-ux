import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "AI Prompt Optimiser",
  description: "Turn rough ideas into clear, structured AI prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <div className="w-full p-4 flex justify-end">
            <LogoutButton />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
