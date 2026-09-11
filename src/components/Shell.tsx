"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Cycle" },
  { href: "/encode", label: "Encode" },
  { href: "/retrieve", label: "Retrieve" },
  { href: "/brain", label: "Brain" },
  { href: "/measure", label: "Measure" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="shell">
      <header className="brand">
        <h1>Humanity&rsquo;s Vault</h1>
        <small>open brain</small>
      </header>
      {children}
      <nav className="nav" aria-label="Learning cycle">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={path === link.href || (link.href !== "/" && path.startsWith(link.href)) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
