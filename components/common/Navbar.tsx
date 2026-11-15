// Next.js provides the Link component for navigation between pages. Instead of: <a href="/dashboard"></a>
// we generally use: <Link href="/dashboard"> ---> </Link>This gives us optimized client-side navigation.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTelegramPlane } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();
  // This component contains the navigation bar
  // that will be shared across different pages of JobPilot.

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Applications", href: "/applications" },
    { name: "AI Analyzer", href: "/analyzer" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Application logo/name */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-white transition-colors duration-200 hover:text-indigo-400"
        >
          <FaTelegramPlane className="text-2xl text-indigo-400" />
          JobPilot
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-sm transition-colors duration-300 ease-in-out ${
                  isActive
                    ? "font-semibold text-indigo-400"
                    : "font-medium text-slate-400 hover:text-indigo-400"
                }`}
              >
                {link.name}

                {/* Animated underline */}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-indigo-400 transition-all duration-300 ease-in-out ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
