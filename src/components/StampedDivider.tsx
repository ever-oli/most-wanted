interface Props {
  label?: string;
  className?: string;
}

export const StampedDivider = ({ label, className = "" }: Props) => (
  <div
    aria-hidden
    className={`flex items-center justify-center gap-3 py-6 text-tan/60 ${className}`}
  >
    <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-tan/40" />
    <span className="font-stamp uppercase text-[10px] tracking-[0.4em] text-tan/70 whitespace-nowrap">
      ★ {label ?? ""} ★
    </span>
    <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-tan/40" />
  </div>
);
