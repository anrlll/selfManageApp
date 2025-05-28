"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function UnauthenticatedView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold tracking-tight">
          セルフマネジメントアプリへようこそ
        </h1>
        <p className="text-lg text-muted-foreground max-w-[600px]">
          タスク管理、スケジュール管理、家計簿など、あなたの生活をより効率的に管理するためのツールを提供します。
          ログインして、あなたの管理を始めましょう。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton mode="modal">
            <Button size="lg" className="gap-2">
              <LogIn className="h-5 w-5" />
              ログイン
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
} 