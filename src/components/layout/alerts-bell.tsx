"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import type { Alert } from "@/server/queries/alerts";

interface AlertsBellProps {
  alerts: Alert[];
}

export function AlertsBell({ alerts }: AlertsBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Alertas"
      >
        <Bell className="h-4 w-4" />
        {alerts.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 max-h-96 w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-lg border bg-card shadow-lg">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold">Alertas</p>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum alerta no momento
            </div>
          ) : (
            <ul className="divide-y">
              {alerts.map((alert, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      {alert.severity === "danger" ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mt-1" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mt-1" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">
                        {alert.link ? (
                          <Link
                            href={alert.link}
                            className="hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            {alert.title}
                          </Link>
                        ) : (
                          alert.title
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
