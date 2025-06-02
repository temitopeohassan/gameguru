import App from "@/components/App";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Launch App",
    action: {
      type: "launch_frame",
      name: "Game Guru",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#CCCACD",
    },
  },
};

export const metadata: Metadata = {
  title: "Game Guru",
  openGraph: {
    title: "Game Guru",
    description: "A sports trivia quiz game Farcaster mini-app",
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function Home() {
  return <App />;
}
