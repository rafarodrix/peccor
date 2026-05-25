"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface DatePickerProps extends Omit<InputProps, "type"> {}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, onClick, ...props }, ref) => {
    const localRef = React.useRef<HTMLInputElement>(null);

    // Encaminha tanto o ref externo quanto o local de forma correta
    React.useImperativeHandle(ref, () => localRef.current!);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      if (localRef.current) {
        try {
          // showPicker() é a API nativa moderna para abrir o seletor do calendário
          localRef.current.showPicker();
        } catch (err) {
          console.warn("Native showPicker not supported or failed:", err);
        }
      }
      onClick?.(e);
    };

    return (
      <div className="relative w-full group">
        <Input
          type="date"
          ref={localRef}
          onClick={handleClick}
          className={cn(
            "pr-10 cursor-pointer appearance-none",
            "active:scale-[0.99] transition-all duration-100",
            // Remove o visual feio padrão do indicador no Webkit (Chrome/Safari) mas mantém clicável por baixo
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            className
          )}
          {...props}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
          <Calendar className="h-4.5 w-4.5" />
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
