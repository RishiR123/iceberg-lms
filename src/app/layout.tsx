import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLoggedInUser } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iceberg | Learning Platform",
  description: "A fast, internal offline learning management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLoggedInUser();

  // Create a clean serializable user object to prevent RSC serialization warnings
  const serializedUser = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  } : null;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <AppShell user={serializedUser}>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
