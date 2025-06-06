"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { API_BASE_URL } from '../config';

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

export function Football() {
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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/football-questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
      // Set the first random question
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

  const getNextQuestion = () => {
    if (questions.length === 0) return null;
    
    // If we've used all questions, reset and start over with random selection
    if (usedQuestionIds.size >= questions.length) {
      setUsedQuestionIds(new Set());
    }
    
    // Get available questions (not used in current cycle)
    const availableQuestions = questions.filter(q => !usedQuestionIds.has(q.id));
    
    // If no available questions, use all questions again
    const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
    
    // Select random question from available pool
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
    
    // Start with a new random question
    if (questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setUsedQuestionIds(new Set([randomQuestion.id]));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card title="Quiz Complete!">
          <div className="text-center space-y-4">
            <Icon name="star" size="lg" className="text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold">Your Score: {score}</h2>
            <p className="text-gray-600">
              You answered {score} question{score !== 1 ? 's' : ''} correctly in a row!
            </p>
            <p className="text-gray-600">
              {score > 10 
                ? "Incredible! You're a true football expert!" 
                : score > 5 
                  ? "Great job! You know football well!" 
                  : score > 2 
                    ? "Good effort! Keep learning!" 
                    : "Keep practicing to improve your knowledge!"}
            </p>
            <Button 
              onClick={handleRestart}
              className="mt-4"
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
        <p className="text-lg text-gray-600">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title={`Question ${score + 1} • Score: ${score}`}>
        <div className="space-y-6">
          <p className="text-lg font-medium">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                } ${
                  isAnswered && option === currentQuestion.answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : ''
                } ${
                  isAnswered && selectedOption === index && !isCorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
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