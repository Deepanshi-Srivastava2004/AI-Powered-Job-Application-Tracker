// Next.js provides the Link component for navigation between pages. Instead of: <a href="/dashboard"></a>
// we generally use: <Link href="/dashboard"> ---> </Link>This gives us optimized client-side navigation.
import Link from "next/link";

export default function Navbar() {
  // This component contains the navigation bar
  // that will be shared across different pages of JobPilot.

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Application logo/name */}
        <Link href="/" className="text-xl font-bold">
          JobPilot
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          {/* Link to Dashboard */}
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-black"
          >
            Dashboard
          </Link>

          {/* Link to Applications */}
          <Link
            href="/applications"
            className="text-sm text-gray-600 hover:text-black"
          >
            Applications
          </Link>

          {/* Link to AI Analyzer */}
          <Link
            href="/analyzer"
            className="text-sm text-gray-600 hover:text-black"
          >
            AI Analyzer
          </Link>
        </div>
      </div>
    </nav>
  );
}
