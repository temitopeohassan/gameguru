"use client";

import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { HomeComponent } from "@/app/components/HomeComponent";

// CELO network configuration
const CELO_CHAIN_ID = 42220; // CELO mainnet chain ID
const CELO_TESTNET_CHAIN_ID = 44787; // CELO Alfajores testnet chain ID

// Create CELO client for network verification
const celoClient = createPublicClient({
  chain: celo,
  transport: http("https://celo-mainnet.g.alchemy.com/v2/Vnn82FUI4zo-yoNZTsNGT"),
});

export default function Home() {
  const { signIn, isLoading, isSignedIn, user } = useSignIn({
    autoSignIn: true,
  });
  const [testResult, setTestResult] = useState<string>("");
  const [networkStatus, setNetworkStatus] = useState<{
    isCorrectNetwork: boolean;
    currentChainId: number | null;
    isChecking: boolean;
    error: string | null;
  }>({
    isCorrectNetwork: false,
    currentChainId: null,
    isChecking: true,
    error: null,
  });

  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const truncateAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if user is on correct CELO network
  const checkCeloNetwork = async () => {
    if (!address) {
      setNetworkStatus({
        isCorrectNetwork: false,
        currentChainId: null,
        isChecking: false,
        error: null,
      });
      return;
    }

    try {
      setNetworkStatus(prev => ({ ...prev, isChecking: true, error: null }));

      // Check if current chain is CELO mainnet or testnet
      const isOnCelo = chainId === CELO_CHAIN_ID || chainId === CELO_TESTNET_CHAIN_ID;

      if (isOnCelo) {
        // Verify by fetching a block from CELO network
        try {
          // Fix: Remove the blockNumber parameter to get the latest block
          const block = await celoClient.getBlock();
          console.log('CELO network verified, latest block:', block.number);
        } catch (blockError) {
          console.warn('Could not verify CELO network by fetching block:', blockError);
        }
      }

      setNetworkStatus({
        isCorrectNetwork: isOnCelo,
        currentChainId: chainId,
        isChecking: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking CELO network:', error);
      setNetworkStatus({
        isCorrectNetwork: false,
        currentChainId: chainId,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Unknown network error',
      });
    }
  };

  // Switch to CELO mainnet
  const switchToCelo = async () => {
    try {
      await switchChain({ chainId: CELO_CHAIN_ID });
    } catch (error) {
      console.error('Error switching to CELO:', error);
      setNetworkStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to switch network',
      }));
    }
  };

  // Check network when wallet connects or chain changes
  useEffect(() => {
    checkCeloNetwork();
  }, [address, chainId]);

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

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case CELO_CHAIN_ID:
        return "CELO Mainnet";
      case CELO_TESTNET_CHAIN_ID:
        return "CELO Alfajores Testnet";
      case 1:
        return "Ethereum Mainnet";
      case 137:
        return "Polygon";
      case 56:
        return "BSC";
      default:
        return `Chain ${chainId}`;
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
            <div className="flex items-center space-x-2">
              {/* Network Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${
                networkStatus.isChecking 
                  ? 'bg-yellow-500 animate-pulse'
                  : networkStatus.isCorrectNetwork 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
              }`} />
              <div className="px-3 py-1.5 bg-[var(--app-gray)] rounded-full text-sm font-medium">
                {truncateAddress(address)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Add padding-top to account for fixed header */}
      <div className="w-full max-w-md mx-auto px-4 py-3 mt-16">
        {/* Network Warning/Status */}
        {address && (
          <div className="mb-4">
            {networkStatus.isChecking ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                <span className="text-yellow-700 text-sm">Checking network...</span>
              </div>
            ) : networkStatus.isCorrectNetwork ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-green-700 text-sm font-medium">Connected to CELO</span>
                  <p className="text-green-600 text-xs">
                    {getChainName(networkStatus.currentChainId)} (Chain ID: {networkStatus.currentChainId})
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 text-sm font-medium">Wrong Network</span>
                </div>
                <p className="text-red-600 text-xs mb-3">
                  Currently on {getChainName(networkStatus.currentChainId)}. 
                  Please switch to CELO network to continue.
                </p>
                <button
                  onClick={switchToCelo}
                  disabled={isSwitchingChain}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isSwitchingChain ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Switching...</span>
                    </>
                  ) : (
                    <span>Switch to CELO Network</span>
                  )}
                </button>
                {networkStatus.error && (
                  <p className="text-red-500 text-xs mt-2">
                    Error: {networkStatus.error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content - Only show if on correct network or no wallet connected */}
        <main className="flex-1">
          {address && !networkStatus.isCorrectNetwork && !networkStatus.isChecking ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Network Required</h3>
              <p className="text-gray-500 text-sm">
                Please switch to the CELO network to access Game Guru features.
              </p>
            </div>
          ) : (
            <HomeComponent />
          )}
        </main>

        {/* Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
            <div className="text-xs space-y-1">
              <p>Chain ID: {chainId}</p>
              <p>Is CELO: {networkStatus.isCorrectNetwork ? 'Yes' : 'No'}</p>
              <p>Checking: {networkStatus.isChecking ? 'Yes' : 'No'}</p>
              {networkStatus.error && <p className="text-red-600">Error: {networkStatus.error}</p>}
            </div>
            <button
              onClick={testAuth}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Test Auth
            </button>
            {testResult && (
              <p className="mt-2 text-xs text-gray-600">{testResult}</p>
            )}
          </div>
        )}

        <footer className="mt-2 pt-4 flex justify-center">
          Game Guru
        </footer>
      </div>
    </div>
  );
}