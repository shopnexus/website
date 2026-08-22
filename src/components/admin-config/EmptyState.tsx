export default function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
      <span className="material-symbols-outlined text-[30px] text-outline">{icon}</span>
      <p className="font-label-md text-on-surface">{title}</p>
      {hint && <p className="font-body-sm text-on-surface-variant max-w-md">{hint}</p>}
    </div>
  );
}
