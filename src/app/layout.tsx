import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@clerk/nextjs/server";
import UnauthenticatedView from "@/components/auth/UnauthenticatedView";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "セルフマネジメントアプリ",
  description: "タスク管理、スケジュール管理、家計簿を一つのアプリで",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={inter.className}>
          {session.userId ? (
            <>
              <Sidebar />
              <main className="md:pl-[200px] min-h-screen">
                {children}
              </main>
            </>
          ) : (
            <UnauthenticatedView />
          )}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}