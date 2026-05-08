type BadgeProps = {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "danger" | "warning";
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const classes =
    variant === "success"
      ? "bg-green-100 text-green-800"
      : variant === "danger"
        ? "bg-red-100 text-red-800"
        : variant === "warning"
          ? "bg-orange-100 text-orange-800"
          : "bg-slate-100 text-slate-800";
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${classes}`}>{children}</span>;
}
