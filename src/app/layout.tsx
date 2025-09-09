import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ErrorProvider } from '@/contexts/error-context';
import { WorkspaceProvider } from '@/contexts/workspace-context';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Automation",
  description: "자동화된 블로그 콘텐츠 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <ErrorProvider>
            <WorkspaceProvider>
              <div className="min-h-screen bg-background text-foreground">
                {/* 테마 토글 버튼 */}
                <div className="fixed top-4 right-4 z-50">
                  <ThemeToggle />
                </div>
                {children}
              </div>
              <Toaster />
            </WorkspaceProvider>
          </ErrorProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
      </body>
    </html>
  );
}
