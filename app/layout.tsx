/* Common application structure */

// Import Next.js Metadata type.
// Metadata is used to define information about our website,
// such as its title and description.
import type { Metadata } from "next";

// Import the default fonts provided by Next.js.
import { Geist, Geist_Mono } from "next/font/google";

// Import our global CSS file.
// This CSS can apply throughout the entire application.
import "./globals.css";

// Import our reusable Navbar component.
// We will display this Navbar across all pages.
import Navbar from "@/components/common/Navbar";

// Configure the Geist Sans font.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the Geist Mono font.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Website metadata.
// This information is used by the browser and search engines.
export const metadata: Metadata = {
  title: "JobPilot",
  description: "AI-Powered Job Application Tracker",
};

// RootLayout is the main layout shared by all pages.
//
// For example:
//
// RootLayout
//    ├── Navbar
//    └── children
//          ├── Dashboard
//          ├── Applications
//          └── AI Analyzer
//
// The `children` represents whichever page the user is currently visiting.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Common navigation shown on every page */}
        <Navbar />

        {/* The current page is rendered here */}
        {children}
      </body>
    </html>
  );
}
