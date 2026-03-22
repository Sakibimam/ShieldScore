export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950">
      <main className="flex flex-col items-center gap-8 py-32 px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ShieldScore
        </h1>
        <p className="max-w-md text-center text-zinc-400">
          Zero-knowledge credit &amp; solvency verification on Midnight.
          Your financial data never leaves your device.
        </p>
        <div className="mt-4">
          {/* Wallet connect button will go here */}
        </div>
      </main>
    </div>
  );
}
