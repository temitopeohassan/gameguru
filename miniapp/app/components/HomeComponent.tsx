"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { Football } from "./Football";

type Sport = {
  name: string;
  icon: "heart" | "star" | "check" | "plus" | "arrow-right";
  description: string;
  component: React.ComponentType;
};

export function HomeComponent() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports: Sport[] = [
    {
      name: "Football",
      icon: "star",
      description: "The world's most popular sport",
      component: Football
    },
    {
      name: "Cricket",
      icon: "heart",
      description: "A bat-and-ball game played between two teams",
      component: () => <div>Coming Soon: Cricket Quiz</div>
    },
    {
      name: "Tennis",
      icon: "check",
      description: "A racket sport played individually or in pairs",
      component: () => <div>Coming Soon: Tennis Quiz</div>
    },
    {
      name: "Basketball",
      icon: "plus",
      description: "A team sport played on a rectangular court",
      component: () => <div>Coming Soon: Basketball Quiz</div>
    }
  ];

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
  };

  const handleBack = () => {
    setSelectedSport(null);
  };

  if (selectedSport) {
    const selectedSportData = sports.find(s => s.name === selectedSport);
    if (selectedSportData) {
      const SportComponent = selectedSportData.component;
      return (
        <div className="space-y-6 animate-fade-in">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mb-4"
          >
            <Icon name="arrow-right" size="sm" className="rotate-180 mr-2" />
            Back to Sports
          </Button>
          <SportComponent />
        </div>
      );
    }
  }

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