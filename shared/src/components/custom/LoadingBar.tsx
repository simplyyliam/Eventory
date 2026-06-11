import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";

interface LoadingBarProps {
  onComplete?: () => void
}

export const LoadingBar = ({ onComplete }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 8;

      if (value >= 92) {
        value = 92;
        clearInterval(interval);

        setProgress(100);

        setTimeout(() => {
          onComplete?.()
        }, 400);
      }

      setProgress(value);
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return <Progress value={progress} className="w-20 h-3"/>;
};