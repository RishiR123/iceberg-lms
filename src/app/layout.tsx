import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { CourseProgressProvider } from "@/components/CourseProgressProvider";
import { Navbar } from "@/components/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLoggedInUser } from "@/lib/auth";
import { getCompletedActivityIds } from "@/app/actions/learningActions";

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
  const completedActivityIds = user ? await getCompletedActivityIds() : [];

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
        <CourseProgressProvider initialCompleted={completedActivityIds}>
          <TooltipProvider>
            <Navbar user={serializedUser} />
            <main className="flex-1 flex flex-col">{children}</main>
          </TooltipProvider>
        </CourseProgressProvider>
      </body>
    </html>
  );
}
