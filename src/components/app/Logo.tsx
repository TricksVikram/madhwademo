interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={`text-[0.85em] font-semibold uppercase tracking-[0.08em] text-primary ${className ?? ""}`}>
      DeskFlow
    </span>
  );
}
