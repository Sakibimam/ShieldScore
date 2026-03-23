import type { ReactNode } from "react";

const nodes = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
];

export default function SystemFrame({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden border border-white/70 bg-zinc-950">
          {nodes.map((position) => (
            <span
              key={position}
              className={`absolute z-10 h-1.5 w-1.5 bg-white ${position}`}
            />
          ))}

          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49.8%,rgba(255,255,255,0.08)_50%,transparent_50.2%),linear-gradient(to_bottom,transparent_49.8%,rgba(255,255,255,0.08)_50%,transparent_50.2%)] bg-[size:32px_32px]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49.8%,rgba(255,255,255,0.08)_50%,transparent_50.2%),linear-gradient(45deg,transparent_49.8%,rgba(255,255,255,0.04)_50%,transparent_50.2%)]" />
          </div>

          <div className="relative z-10">{header}</div>

          <div className="relative z-10 grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)_220px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
