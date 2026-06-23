export default function ZaloIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#0068FF" />
      <path
        fill="#fff"
        d="M24.3 11.5c-7.3 0-13.2 5-13.2 11.2 0 3.9 2.3 7.3 5.8 9.4-.2.9-.9 3.1-1 3.6-.1.5.3.5.5.4.2-.1 3.1-2.1 4.4-2.9 1.1.3 2.3.4 3.5.4 7.3 0 13.2-5 13.2-11.2s-5.9-10.9-13.2-10.9Z"
      />
    </svg>
  );
}
