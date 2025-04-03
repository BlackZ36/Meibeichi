import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const spinnerVariants = (show) =>
  show ? "flex flex-col items-center justify-center" : "hidden";

const loaderVariants = (size) => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };
  return `animate-spin text-primary ${sizes[size] || sizes.medium}`;
};

export function Spinner({ size = "medium", show = true, children, className }) {
  return (
    <span className={spinnerVariants(show)}>
      <Loader2 className={cn(loaderVariants(size), className)} />
      {children}
    </span>
  );
}
