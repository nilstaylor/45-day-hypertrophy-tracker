export function Logo({ size = 28, className = '' }) {
  return (
    <svg
      role="img"
      aria-label="45-Day Hypertrophy Sprint"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
    >
      <rect width="32" height="32" rx="7" fill="#0a0b0d" />
      {/* Stylized H */}
      <path
        d="M7 22 L7 10 L11 10 L11 14 L21 14 L21 10 L25 10 L25 22 L21 22 L21 18 L11 18 L11 22 Z"
        fill="#39ff8a"
      />
    </svg>
  );
}
