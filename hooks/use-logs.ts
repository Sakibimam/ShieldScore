"use client";

import { useCallback, useState } from "react";

export type LogEntry = {
  time: string;
  label: string;
  status: "ok" | "fail" | "...";
};

function timestamp() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export type Logs = {
  /** All log entries, newest first */
  entries: LogEntry[];
  /** Append a log entry */
  push: (label: string, status?: LogEntry["status"]) => void;
  /** Clear all logs */
  clear: () => void;
};

/**
 * React hook for structured event logging.
 *
 * Auto-timestamps each entry. Newest entries appear first.
 *
 * ```tsx
 * const logs = useLogs();
 * logs.push("wallet_connected");
 * logs.push("verify_fail", "fail");
 * ```
 */
export function useLogs(): Logs {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const push = useCallback((label: string, status: LogEntry["status"] = "ok") => {
    setEntries((prev) => [{ time: timestamp(), label, status }, ...prev]);
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, push, clear };
}
