import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-1.5 w-full", className)} {...props}>
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive font-semibold">*</span>}
        </Label>
        {error && (
          <span className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
