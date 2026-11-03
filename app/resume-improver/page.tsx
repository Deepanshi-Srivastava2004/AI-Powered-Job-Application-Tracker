"use client";

import { useState } from "react";

// Define the structure of the AI response.
interface ResumeAnalysis {
  overallAssessment: string;
  strengths: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  summarySuggestion: string;
  improvedBulletPoints: string[];
}

export default function ResumeImproverPage() {
  // Store the user's resume text.
  const [resumeText, setResumeText] = useState("");

  // Stores which section was copied successfully.
  const [copiedSection, setCopiedSection] = useState<
    "summary" | "bullets" | null
  >(null);

  // Copies the selected AI-generated content to the clipboard.
  const handleCopy = async (text: string, section: "summary" | "bullets") => {
    try {
      await navigator.clipboard.writeText(text);

      // Show which section was copied.
      setCopiedSection(section);
    } catch (error) {
      console.error("Unable to copy text:", error);
      setError("Unable to copy text. Please try again.");
    }
  };

  // Store the target job description.
  const [jobDescription, setJobDescription] = useState("");

  // Store the AI analysis response.
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  // Track whether the API request is running.
  const [loading, setLoading] = useState(false);

  // Store error messages.
  const [error, setError] = useState("");

  // Handle the Analyze Resume button.
  async function handleAnalyze() {
    // Validate the inputs.
    if (!resumeText.trim()) {
      setError("Please enter your resume text.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    // Reset previous results and errors.
    setError("");
    setAnalysis(null);
    setLoading(true);
    setCopiedSection(null);

    try {
      // Send both inputs to our Next.js API.
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      // Convert the API response into JSON.
      const result = await response.json();

      // Handle API errors.
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to analyze your resume.");
      }

      // Save the returned analysis.
      setAnalysis(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      // Stop the loading indicator.
      setLoading(false);
    }
  }

  // Reusable component for displaying result lists.
  function ResultSection({
    title,
    items,
    icon,
  }: {
    title: string;
    items: string[];
    icon: string;
  }) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span>{icon}</span>
          {title}
        </h3>

        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm leading-6 text-gray-600"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No suggestions available.</p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            JobPilot AI
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            AI Resume Improver
          </h1>

          <p className="mt-3 text-gray-600">
            Improve your resume according to your target job using AI-powered
            suggestions.
          </p>
        </div>

        {/* Input section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume input */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="resumeText"
              className="mb-3 block font-semibold text-gray-800"
            >
              Your Resume
            </label>

            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={12}
              maxLength={15000}
              className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-2 text-right text-xs text-gray-500">
              {resumeText.length}/15000 characters
            </p>
          </div>

          {/* Job description input */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="jobDescription"
              className="mb-3 block font-semibold text-gray-800"
            >
              Target Job Description
            </label>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={12}
              maxLength={20000}
              className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-2 text-right text-xs text-gray-500">
              {jobDescription.length}/20000 characters
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Analyze button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

          {loading && (
            <p className="mt-3 text-sm text-gray-500">
              Gemini is reviewing your resume. Please wait...
            </p>
          )}
        </div>

        {/* AI analysis results */}
        {analysis && (
          <section className="mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Resume Analysis
              </h2>

              <p className="mt-2 text-gray-600">
                Here are your personalized resume improvement suggestions.
              </p>
            </div>

            {/* Overall assessment */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
              <h3 className="mb-2 font-semibold text-indigo-900">
                Overall Assessment
              </h3>

              <p className="text-sm leading-7 text-indigo-800">
                {analysis.overallAssessment}
              </p>
            </div>

            {/* Strengths and missing skills */}
            <div className="grid gap-6 md:grid-cols-2">
              <ResultSection
                title="Your Strengths"
                items={analysis.strengths}
                icon="✅"
              />

              <ResultSection
                title="Skills to Review"
                items={analysis.missingSkills}
                icon="🎯"
              />
            </div>

            {/* Improvement suggestions */}
            <ResultSection
              title="Improvement Suggestions"
              items={analysis.improvementSuggestions}
              icon="💡"
            />

            {/* Suggested professional summary */}
            {/* Suggested professional summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Suggested Professional Summary
              </h3>

              <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                {analysis.summarySuggestion}
              </p>

              {/* Copy Summary Button */}
              <button
                onClick={() =>
                  handleCopy(analysis.summarySuggestion, "summary")
                }
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {copiedSection === "summary" ? "Copied!" : "Copy Summary"}
              </button>
            </div>

            {/* Improved resume bullet points */}
            {/* Improved resume bullet points */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <span>📝</span>
                Improved Resume Bullet Points
              </h3>

              <ul className="space-y-3">
                {analysis.improvedBulletPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-6 text-gray-600"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    {point}
                  </li>
                ))}
              </ul>

              {/* Copy Bullet Points Button */}
              <button
                onClick={() =>
                  handleCopy(
                    analysis.improvedBulletPoints
                      .map((point) => `• ${point}`)
                      .join("\n"),
                    "bullets",
                  )
                }
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {copiedSection === "bullets" ? "Copied!" : "Copy Bullet Points"}
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Review all AI-generated suggestions and ensure they accurately
              reflect your real experience.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
