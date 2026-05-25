"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
        <div className="relative flex h-4 w-4 shrink-0">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            className="peer h-4 w-4 shrink-0 rounded-sm border border-primary appearance-none checked:bg-primary cursor-pointer"
            {...props}
          />
          <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-primary-foreground hidden peer-checked:block" />
        </div>
        {label && <span className="text-sm font-medium leading-none">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
