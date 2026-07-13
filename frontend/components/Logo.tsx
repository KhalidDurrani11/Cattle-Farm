import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({ className = '', size = 44, showText = true, textClassName = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex-shrink-0 rounded-xl bg-white p-1 shadow-sm border border-gray-100 dark:border-white/10 dark:bg-white/10"
        style={{ width: size + 8, height: size + 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Image
          src="/logo.png"
          alt="Cattle Farm Trading Logo"
          width={size}
          height={size}
          className="object-contain"
          style={{ mixBlendMode: 'multiply' }}
          priority
        />
      </span>
      {showText && (
        <span className={`font-bold tracking-tight leading-tight text-[#1E4620] dark:text-[#8FBC8F] ${textClassName}`}>
          Cattle Farm
        </span>
      )}
    </span>
  );
}
