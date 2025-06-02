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
      <div className="w-full max-w-md mx-auto px-4 py-3">
        

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
