import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface InstitutionalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export const InstitutionalButton = forwardRef<HTMLButtonElement, InstitutionalButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-yellow focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-institutional-blue text-white hover:bg-institutional-yellow hover:text-black": variant === "primary",
            "bg-white text-institutional-blue border-2 border-institutional-blue hover:bg-institutional-blue hover:text-white": variant === "secondary",
            "bg-transparent text-current hover:bg-black/5": variant === "ghost",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

InstitutionalButton.displayName = "InstitutionalButton";
