import dynamic from "next/dynamic";
import { Suspense } from "react";

const Home = dynamic(() => import("@/components/Home"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-[var(--app-background)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--app-accent)] border-t-transparent mx-auto mb-4"></div>
        <p className="text-[var(--app-foreground)]">Loading Game Guru...</p>
      </div>
    </div>
  ),
});

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[var(--app-background)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--app-accent)] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[var(--app-foreground)]">Loading Game Guru...</p>
          </div>
        </div>
      }
    >
      <Home />
    </Suspense>
  );
}