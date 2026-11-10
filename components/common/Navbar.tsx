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
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Application logo/name */}
        <Link
          href="/"
          className="flex items-center text-xl text-[#111827] font-bold"
        >
          <FaTelegramPlane className="mr-2 text-[#6366F1]" />
          JobPilot
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-sm transition-colors duration-300 ease-in-out ${
                  isActive
                    ? "font-semibold text-[#6366F1]"
                    : "text-gray-600 hover:text-[#6366F1]"
                }`}
              >
                {link.name}

                {/* Animated underline */}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#6366F1] transition-all duration-300 ease-in-out ${
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
