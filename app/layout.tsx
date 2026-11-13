import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import { AppShell } from "@/components/workspace/AppShell";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { currentUser, publicUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Lucy Voting", template: "%s · Lucy Voting" },
  description: "Shareholders Voting System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          value={{ light: "light", dark: "dark" }}
          enableSystem>
          <AuthProvider initialUser={user ? publicUser(user) : null}>
            <AppShell>{children}</AppShell>
          </AuthProvider>
          <Toaster
            position="top-center"
            richColors
            duration={3000} // 3 seconds timeout for the toast messages
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
