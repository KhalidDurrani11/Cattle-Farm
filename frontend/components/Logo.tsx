import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({ className = '', size = 52, showText = true, textClassName = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="Cattle Farm Trading Logo"
        width={size}
        height={size}
        className="object-contain flex-shrink-0 dark:invert"
        priority
      />
      {showText && (
        <span className={`text-xl font-extrabold tracking-tight leading-tight text-[#1E4620] dark:text-[#8FBC8F] ${textClassName}`}>
          Cattle Farm
        </span>
      )}
    </span>
  );
}
