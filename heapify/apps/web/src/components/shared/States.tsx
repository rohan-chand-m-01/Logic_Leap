export function SkeletonCard() {
  return <div className="animate-pulse bg-slate-200 rounded h-24" aria-label="loading" />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border border-red-200 bg-red-50 p-4 rounded"><div className="text-red-700 font-medium">⚠ {message}</div><button className="mt-2 px-3 py-1 bg-red-600 text-white rounded" onClick={onRetry}>Retry</button></div>;
}

export function EmptyState({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return <div className="border border-slate-200 bg-white p-6 rounded text-center text-slate-500">📭 {message}{cta ? <div className="mt-3">{cta}</div> : null}</div>;
}
