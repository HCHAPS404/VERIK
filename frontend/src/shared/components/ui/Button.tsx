type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-gov-primary text-white hover:opacity-90"
      : "bg-white text-gov-foreground border border-gov-border hover:bg-gov-muted";

  return <button type={type} className={`rounded-md px-4 py-2 text-sm font-medium ${styles} ${className}`} {...props} />;
}
