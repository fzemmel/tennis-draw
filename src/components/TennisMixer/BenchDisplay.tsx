interface BenchDisplayProps {
  player: string;
}

export function BenchDisplay({ player }: BenchDisplayProps) {
  return (
    <div className="bg-slate-800 rounded-xl px-3.5 py-2.5 text-center border border-dashed border-slate-600">
      <span className="text-sm text-slate-400">PAUSE ☕ </span>
      <span className="text-lg font-bold">{player}</span>
    </div>
  );
}
