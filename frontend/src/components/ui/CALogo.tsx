import Image from "next/image";
import Link from "next/link";

interface CALogoProps {
  /** Height in pixels (width scales proportionally) */
  size?: number;
  /** Wrap in a link to home */
  asLink?: boolean;
  className?: string;
}

export function CALogo({ size = 48, asLink = true, className = "" }: CALogoProps) {
  const width = Math.round(size * (300 / 180)); // preserve aspect ratio

  const img = (
    <Image
      src="/ca-logo.svg"
      alt="CAConnect — India's CA Platform"
      width={width}
      height={size}
      className={`object-contain ${className}`}
      priority
      unoptimized
    />
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex items-center shrink-0" aria-label="CAConnect home">
        {img}
      </Link>
    );
  }

  return <div className={`inline-flex items-center shrink-0`}>{img}</div>;
}
