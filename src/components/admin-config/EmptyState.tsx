export default function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-2 px-6">
      <span className="material-symbols-outlined text-[40px] text-outline">{icon}</span>
      <p className="font-label-md text-on-surface">{title}</p>
      {hint && <p className="font-body-sm text-on-surface-variant max-w-md">{hint}</p>}
    </div>
  );
}
