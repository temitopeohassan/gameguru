"use client";

import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import { HomeComponent } from "@/app/components/HomeComponent";

export default function Home() {
  const { signIn, isLoading, isSignedIn, user } = useSignIn({
    autoSignIn: true,
  });
  const [testResult, setTestResult] = useState<string>("");

  const { address } = useAccount();

  const truncateAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const testAuth = async () => {
    try {
      const res = await fetch("/api/test", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setTestResult(`Auth test failed: ${data.error}`);
        return;
      }

      setTestResult(`Auth test succeeded! Server response: ${data.message}`);
    } catch (error) {
      setTestResult(
        "Auth test failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--app-background)] border-b border-[var(--app-gray)] z-50">
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="Game Guru Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold">Game Guru</h1>
          </div>
          {address && (
            <div className="px-3 py-1.5 bg-[var(--app-gray)] rounded-full text-sm font-medium">
              {truncateAddress(address)}
            </div>
          )}
        </div>
      </header>

      {/* Add padding-top to account for fixed header */}
      <div className="w-full max-w-md mx-auto px-4 py-3 mt-16">
        <main className="flex-1">
          <HomeComponent />
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          Game Guru
        </footer>
      </div>
    </div>
  );
}