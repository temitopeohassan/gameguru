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
const NFT_CONTRACT_ADDRESS = "0x6A0F4AdD27463B1EC3ce1a35a545A3598bA76c96";
const NFT_ABI = parseAbi([
  'function mint(address to, uint256 score, string memory metadata) public returns (uint256)',
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
  const { theme } = useTheme();
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

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
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

  const mintNFT = async () => {
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

      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [address, BigInt(score), metadata],
      });

    } catch (err) {
      console.error('Error minting NFT:', err);
      setError('Failed to mint NFT. Please try again.');
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
      // Trigger NFT minting when user gets a question wrong
      mintNFT();
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

  if (!mounted) {
    return null; // Prevent flash of wrong theme
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card title="Quiz Complete!">
          <div className="text-center space-y-4">
            <Icon name="star" size="lg" className="text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Score: {score}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You answered {score} question{score !== 1 ? 's' : ''} correctly in a row!
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {score > 10 
                ? "Incredible! You're a true football expert!" 
                : score > 5 
                  ? "Great job! You know football well!" 
                  : score > 2 
                    ? "Good effort! Keep learning!" 
                    : "Keep practicing to improve your knowledge!"}
            </p>

            {/* Minting in Progress */}
            {isMinting && !mintingComplete && (
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                    <span className="text-yellow-700 dark:text-yellow-300">
                      {isConfirming ? 'Confirming transaction...' : 'Minting your NFT...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Minting Complete */}
            {mintingComplete && (
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    🎉 NFT Minted Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Your football quiz score has been immortalized as an NFT
                  </p>
                  {hash && (
                    <p className="text-xs text-green-500 dark:text-green-400 mt-2 break-all">
                      Transaction: {hash}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Connection Required */}
            {!address && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Connect your wallet to mint your score as an NFT
                </p>
              </div>
            )}

            {/* Error Display */}
            {(writeError || confirmError || error) && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">
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
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600 dark:text-gray-300">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title={`Question ${score + 1} • Score: ${score}`}>
        <div className="space-y-6">
          <p className="text-lg font-medium text-gray-900 dark:text-white">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-900 dark:text-white'
                } ${
                  isAnswered && option === currentQuestion.answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                    : ''
                } ${
                  isAnswered && selectedOption === index && !isCorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
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
              <div className={`p-4 rounded-lg ${
                isCorrect 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
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