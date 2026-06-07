import { PageContainer } from "@/shared/components";
import { Progress } from "@app/shared";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.destination;
  const eventName = location.state?.eventName;

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 8;

      if (value >= 92) {
        value = 92;
        clearInterval(interval);

        // Fill to 100 then navigate
        setProgress(100);
        setTimeout(() => {
          navigate(destination ?? '/', { replace: true });
        }, 400);
      }

      setProgress(value);
    }, 120);

    return () => clearInterval(interval);
  }, [destination, navigate]);

  return (
    <PageContainer className="items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <span>{eventName}</span>
        <Progress value={progress} className="h-3 w-20"/>
      </div>
    </PageContainer>
  );
}