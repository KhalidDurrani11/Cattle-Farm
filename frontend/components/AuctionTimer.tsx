'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AuctionTimerProps {
  endTime: string | Date;
  onEnd?: () => void;
}

export default function AuctionTimer({ endTime, onEnd }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        if (onEnd) onEnd();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (!timeLeft) {
    return (
      <div className="flex items-center text-red-500 font-bold text-sm">
        <Clock className="w-4 h-4 mr-1" />
        Auction Ended
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5 text-earth-800 dark:text-earth-200 bg-earth-100 dark:bg-earth-800 px-2 py-1 rounded-md text-sm border border-earth-200 dark:border-earth-700">
      <Clock className="w-4 h-4 text-amber-500" />
      <div className="flex space-x-1 font-mono font-medium">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
        <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>
        <span>{timeLeft.seconds.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
}
