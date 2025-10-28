import React from "react";
import { LuLoaderCircle } from "react-icons/lu";

interface SpinnerLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullScreen?: boolean;
}

const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({
  size = "md",
  color = "text-primary",
  fullScreen = true,
}) => {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-7xl",
  };

  return (
    <div
      className={`flex justify-center flex-col items-center ${fullScreen ? "h-screen" : ""}`}
    >
      <LuLoaderCircle
        className={`animate-spin ${sizeClasses[size]} ${color}`}
        aria-label="Loading..."
      />
      Loading...
    </div>
  );
};

export default SpinnerLoader;
