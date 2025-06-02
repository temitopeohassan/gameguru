"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient, useConnect } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Button } from "./Button";
import { Card } from "./Card";
import { API_BASE_URL } from '../config';
import { injected } from 'wagmi/connectors';
import { Icon } from "./Icon";
import { sdk } from '@farcaster/frame-sdk'

type Sport = {
  name: string;
  icon: "heart" | "star" | "check" | "plus" | "arrow-right";
  description: string;
};

export function HomeComponent() {
  const sports: Sport[] = [
    {
      name: "Football",
      icon: "star",
      description: "The world's most popular sport"
    },
    {
      name: "Cricket",
      icon: "heart",
      description: "A bat-and-ball game played between two teams"
    },
    {
      name: "Tennis",
      icon: "check",
      description: "A racket sport played individually or in pairs"
    },
    {
      name: "Basketball",
      icon: "plus",
      description: "A team sport played on a rectangular court"
    }
  ];

  const handleSportSelect = (sport: string) => {
    console.log(`Selected sport: ${sport}`);
    // Add your sport selection logic here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Select Your Sport">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sports.map((sport) => (
            <Button
              key={sport.name}
              onClick={() => handleSportSelect(sport.name)}
              className="flex items-center justify-center space-x-2 p-4 h-24 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Icon name={sport.icon} size="lg" className="text-white" />
              <div className="text-left">
                <h3 className="font-bold text-lg">{sport.name}</h3>
                <p className="text-sm text-white/80">{sport.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}