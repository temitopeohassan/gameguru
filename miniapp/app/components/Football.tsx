"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { API_BASE_URL } from '../config';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { useTheme } from 'next-themes';

// NFT Contract configuration
const NFT_CONTRACT_ADDRESS = "0x6D8B3E655519a31F80cc90bbA06c0ad9a97BAf69";
const NFT_ABI = parseAbi([
  'function mint(address to, uint256 score, string memory metadata) public payable returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)'
]);

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

export function Football() {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<number>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingComplete, setMintingComplete] = useState(false);
  const [tokenId, setTokenId] = useState<number | null>(null);

  // Wagmi hooks
  const { address } = useAccount();
  const { 
    data: hash, 
    writeContract, 
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({ 
    hash,
  });

  // Enhanced theme detection
  const getCurrentTheme = () => {
    if (!mounted) return 'light'; // Default to light during SSR
    
    // Use resolvedTheme first (accounts for system preference)
    if (resolvedTheme) return resolvedTheme;
    
    // Fallback to theme setting
    if (theme && theme !== 'system') return theme;
    
    // Fallback to system theme
    if (systemTheme) return systemTheme;
    
    // Final fallback: detect from system directly
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light';
  };

  const currentTheme = getCurrentTheme();
  const isDarkMode = currentTheme === 'dark';

  // Handle theme mounting with enhanced detection
  useEffect(() => {
    setMounted(true);
    
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        // Force re-render when system theme changes
        setMounted(false);
        setTimeout(() => setMounted(true), 0);
      };
      
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle successful NFT minting
  useEffect(() => {
    if (isConfirmed && isMinting) {
      setMintingComplete(true);
      setIsMinting(false);
    }
  }, [isConfirmed, isMinting]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/football-questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
      if (data.length > 0) {
        const randomQuestion = data[Math.floor(Math.random() * data.length)];
        setCurrentQuestion(randomQuestion);
        setUsedQuestionIds(new Set([randomQuestion.id]));
      }
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced mintNFT function with better error handling and debugging
const mintNFT = async () => {
  if (!address) {
    setError("Please connect your wallet to mint NFT");
    return;
  }

  try {
    setIsMinting(true);
    setError(null);

    console.log("=== NFT Minting Details ===");
    console.log("Wallet address:", address);
    console.log("Contract address:", NFT_CONTRACT_ADDRESS);
    console.log("Score:", score);

    const metadata = JSON.stringify({
      name: `Football Quiz Score: ${score}`,
      description: `You scored ${score} correct answers in a row!`,
      image: "", // Add your NFT image URL here
      attributes: [
        {
          trait_type: "Score",
          value: score
        },
        {
          trait_type: "Game",
          value: "Football Quiz"
        },
        {
          trait_type: "Date",
          value: new Date().toISOString()
        }
      ]
    });

    console.log("=== Contract Parameters ===");
    console.log("Function: mint");
    console.log("Arguments:", {
      to: address,
      score: BigInt(score),
      metadata: metadata
    });
    console.log("Value (in wei):", BigInt("1000000000000000")); // 0.001 CELO
    console.log("Gas limit:", BigInt("5000000"));

    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [address, BigInt(score), metadata],
      value: BigInt("100000000000000"), // 0.0001 CELO in wei
      gas: BigInt("50000000000000"), // Set a reasonable gas limit
    });

    console.log("=== Transaction Initiated ===");
    console.log("Waiting for transaction confirmation...");

  } catch (err) {
    console.error('=== NFT Minting Error ===');
    console.error('Error details:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error message:', errorMessage);
    setError(`Failed to mint NFT: ${errorMessage}`);
    setIsMinting(false);
  }
};

// Alternative version with lower mint fee to test
const mintNFTWithLowerFee = async () => {
  if (!address) {
    setError("Please connect your wallet to mint NFT");
    return;
  }

  try {
    setIsMinting(true);
    setError(null);

    const metadata = JSON.stringify({
      name: `Football Quiz Score: ${score}`,
      description: `You scored ${score} correct answers in a row!`,
      image: "",
      attributes: [
        {
          trait_type: "Score",
          value: score
        },
        {
          trait_type: "Game",
          value: "Football Quiz"
        },
        {
          trait_type: "Date",
          value: new Date().toISOString()
        }
      ]
    });

    // Try with a much lower value first to test if it's a value issue
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [address, BigInt(score), metadata],
      value: BigInt("1000000000000000"), // 0.001 CELO in wei (much lower)
      gas: BigInt("500000"),
    });

  } catch (err) {
    console.error('Error minting NFT:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(`Failed to mint NFT: ${errorMessage}`);
    setIsMinting(false);
  }
};

// Version without payment to test if the contract requires payment
const mintNFTFree = async () => {
  if (!address) {
    setError("Please connect your wallet to mint NFT");
    return;
  }

  try {
    setIsMinting(true);
    setError(null);

    const metadata = JSON.stringify({
      name: `Football Quiz Score: ${score}`,
      description: `You scored ${score} correct answers in a row!`,
      image: "",
      attributes: [
        {
          trait_type: "Score",
          value: score
        },
        {
          trait_type: "Game",
          value: "Football Quiz"
        },
        {
          trait_type: "Date",
          value: new Date().toISOString()
        }
      ]
    });

    // Try without sending CELO to see if the contract is free
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [address, BigInt(score), metadata],
      // Remove the value parameter entirely
      gas: BigInt("500000"),
    });

  } catch (err) {
    console.error('Error minting NFT:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(`Failed to mint NFT: ${errorMessage}`);
    setIsMinting(false);
  }
};

  const getNextQuestion = () => {
    if (questions.length === 0) return null;
    
    if (usedQuestionIds.size >= questions.length) {
      setUsedQuestionIds(new Set());
    }
    
    const availableQuestions = questions.filter(q => !usedQuestionIds.has(q.id));
    const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    return questionPool[randomIndex];
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;

    const correct = currentQuestion.options[selectedOption] === currentQuestion.answer;
    
    setIsAnswered(true);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = getNextQuestion();
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setUsedQuestionIds(prev => new Set(Array.from(prev).concat(nextQuestion.id)));
    }
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleRestart = () => {
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setGameOver(false);
    setUsedQuestionIds(new Set());
    setIsMinting(false);
    setMintingComplete(false);
    setTokenId(null);
    setError(null);
    
    if (questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setUsedQuestionIds(new Set([randomQuestion.id]));
    }
  };

  // Enhanced loading screen with theme-aware styling
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className={`text-lg transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center space-y-4">
          <Icon name="alert-circle" size="lg" className="text-red-500 mx-auto" />
          <p className={`text-lg transition-colors duration-200 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className={`space-y-6 animate-fade-in transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <Card title="Quiz Complete!">
          <div className="text-center space-y-4">
            <Icon name="star" size="lg" className="text-yellow-500 mx-auto" />
            <h2 className={`text-2xl font-bold transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Your Score: {score}
            </h2>
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You answered {score} question{score !== 1 ? 's' : ''} correctly in a row!
            </p>
            <p className={`transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {score > 10 
                ? "Incredible! You're a true football expert!" 
                : score > 5 
                  ? "Great job! You know football well!" 
                  : score > 2 
                    ? "Good effort! Keep learning!" 
                    : "Keep practicing to improve your knowledge!"}
            </p>

            {/* Mint NFT Button */}
            {!isMinting && !mintingComplete && (
              <Button 
                onClick={mintNFT}
                className="mt-4"
                disabled={!address}
              >
                {address ? 'Mint Your Score as NFT' : 'Connect Wallet to Mint NFT'}
              </Button>
            )}

            {/* Minting in Progress */}
            {isMinting && !mintingComplete && (
              <div className="space-y-4 mt-6">
                <div className={`p-4 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-yellow-900/20 border border-yellow-800' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                    <span className={`transition-colors duration-200 ${
                      isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      {isConfirming ? 'Confirming transaction...' : 'Minting your NFT...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Minting Complete */}
            {mintingComplete && (
              <div className="space-y-4 mt-6">
                <div className={`p-4 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-green-900/20 border border-green-800' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <h3 className={`font-semibold transition-colors duration-200 ${
                    isDarkMode ? 'text-green-200' : 'text-green-800'
                  }`}>
                    🎉 NFT Minted Successfully!
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-200 ${
                    isDarkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    Your football quiz score has been immortalized as an NFT
                  </p>
                  {hash && (
                    <p className={`text-xs mt-2 break-all transition-colors duration-200 ${
                      isDarkMode ? 'text-green-400' : 'text-green-500'
                    }`}>
                      Transaction: {hash}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Connection Required */}
            {!address && (
              <div className={`mt-6 p-4 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-orange-900/20 border border-orange-800' 
                  : 'bg-orange-50 border border-orange-200'
              }`}>
                <p className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-700'
                }`}>
                  Connect your wallet to mint your score as an NFT
                </p>
              </div>
            )}

            {/* Error Display */}
            {(writeError || confirmError || error) && (
              <div className={`mt-4 p-4 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-red-300' : 'text-red-700'
                }`}>
                  {error || writeError?.message || confirmError?.message}
                </p>
              </div>
            )}

            <Button 
              onClick={handleRestart}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center space-y-4">
          <Icon name="help-circle" size="lg" className="text-gray-400 mx-auto" />
          <p className={`text-lg transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No questions available.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-fade-in transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <Card title={`Question ${score + 1} • Score: ${score}`}>
        <div className="space-y-6">
          <p className={`text-lg font-medium transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {currentQuestion.question}
          </p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                  selectedOption === index
                    ? isDarkMode
                      ? 'border-blue-400 bg-blue-900/30 text-blue-100'
                      : 'border-blue-500 bg-blue-50 text-blue-900'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-blue-400 text-white hover:bg-gray-800'
                      : 'border-gray-200 hover:border-blue-300 text-gray-900 hover:bg-gray-50'
                } ${
                  isAnswered && option === currentQuestion.answer
                    ? isDarkMode
                      ? 'border-green-400 bg-green-900/30 text-green-100'
                      : 'border-green-500 bg-green-50 text-green-900'
                    : ''
                } ${
                  isAnswered && selectedOption === index && !isCorrect
                    ? isDarkMode
                      ? 'border-red-400 bg-red-900/30 text-red-100'
                      : 'border-red-500 bg-red-50 text-red-900'
                    : ''
                }`}
                disabled={isAnswered}
              >
                {option}
              </button>
            ))}
          </div>

          {!isAnswered && (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          )}

          {isAnswered && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg transition-colors duration-200 ${
                isCorrect 
                  ? isDarkMode
                    ? 'bg-green-900/30 text-green-200 border border-green-700'
                    : 'bg-green-50 text-green-700 border border-green-200'
                  : isDarkMode
                    ? 'bg-red-900/30 text-red-200 border border-red-700'
                    : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <p className="font-medium">
                  {isCorrect ? 'Correct!' : 'Incorrect!'}
                </p>
                {!isCorrect && (
                  <p className="mt-1">
                    The correct answer was: {currentQuestion.answer}
                  </p>
                )}
              </div>
              
              {isCorrect && (
                <Button onClick={handleNextQuestion} className="w-full">
                  Next Question
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}