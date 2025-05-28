"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogIn } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

const routes = [
  {
    href: "/",
    label: "ホーム",
  },
  {
    href: "/todos",
    label: "Todoリスト",
  },
  {
    href: "/schedule",
    label: "スケジュール",
  },
  {
    href: "/finance",
    label: "家計簿",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="space-y-4 py-4 flex flex-col h-full bg-background">
            <div className="px-3 py-2">
              {user ? (
                <div className="flex items-center gap-2 px-4 mb-4">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.fullName}</span>
                </div>
              ) : (
                <div className="px-4 mb-4">
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      ログイン
                    </Button>
                  </SignInButton>
                </div>
              )}
              <h2 className="mb-2 px-4 text-lg font-semibold">
                メニュー
              </h2>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                      pathname === route.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
            </div>
            {user && (
              <div className="mt-auto px-3 py-2">
                <SignOutButton>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    ログアウト
                  </Button>
                </SignOutButton>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex h-full w-[200px] flex-col fixed left-0 top-0 border-r bg-background">
        <div className="space-y-4 py-4 flex flex-col h-full">
          <div className="px-3 py-2">
            {user ? (
              <div className="flex items-center gap-2 px-4 mb-4">
                <User className="h-5 w-5" />
                <span className="font-medium">{user.fullName}</span>
              </div>
            ) : (
              <div className="px-4 mb-4">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                    ログイン
                  </Button>
                </SignInButton>
              </div>
            )}
            <h2 className="mb-2 px-4 text-lg font-semibold">
              メニュー
            </h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                    pathname === route.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <div className="mt-auto px-3 py-2">
              <SignOutButton>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  ログアウト
                </Button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 