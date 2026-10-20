"use client";

import { useState } from "react";

type InterviewQuestion = {
  question: string;
  type: string;
};

type JobAnalysis = {
  jobTitle: string;
  experienceLevel: string;
  summary: string;
  requiredSkills: string[];
  keyResponsibilities: string[];
  interviewQuestions: InterviewQuestion[];
};

export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  // Sample skills for testing. Replace these with your own skills.
  const [userSkills, setUserSkills] = useState("React, TypeScript, SQL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Convert skill names into a consistent format for comparison.
  function normalizeSkill(skill: string) {
    return skill.trim().toLowerCase().replace(/\s+/g, " ");
  }

  // Split the entered skills using commas, semicolons, or new lines.
  const enteredSkills = userSkills
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  // Use a Set for efficient skill lookups.
  const normalizedUserSkills = new Set(enteredSkills.map(normalizeSkill));

  // Find required skills that the user has entered.
  const matchedSkills = (analysis?.requiredSkills ?? []).filter((skill) =>
    normalizedUserSkills.has(normalizeSkill(skill)),
  );

  // Find required skills that the user has not entered.
  const missingSkills = (analysis?.requiredSkills ?? []).filter(
    (skill) => !normalizedUserSkills.has(normalizeSkill(skill)),
  );

  // Calculate the percentage of required skills matched.
  const matchPercentage =
    (analysis?.requiredSkills.length ?? 0) > 0
      ? Math.round(
          (matchedSkills.length / analysis!.requiredSkills.length) * 100,
        )
      : 0;

  async function handleAnalyze() {
    // Validate the input.
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    if (enteredSkills.length === 0) {
      setError("Please enter your existing skills first.");
      return;
    }

    // Reset previous results and errors.
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // Send the job description to our backend API.
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      });

      const result = await response.json();

      // Handle unsuccessful API responses.
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to analyze the job description.",
        );
      }

      // Store the AI-generated results.
      setAnalysis(result.data as JobAnalysis);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      // Always stop the loading indicator.
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            JobPilot AI
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            AI Job Description Analyzer
          </h1>

          <p className="mt-3 text-slate-400">
            Understand job requirements, discover key skills, and prepare for
            your next interview.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
          <label
            htmlFor="jobDescription"
            className="mb-3 block text-lg font-semibold"
          >
            Paste Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the complete job description here..."
            rows={10}
            maxLength={20000}
            disabled={loading}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
          />

          <div className="mt-2 flex justify-between gap-3 text-xs text-slate-400">
            <span>Include skills and responsibilities for better results.</span>
            <span>{jobDescription.length}/20000</span>
          </div>

          {/* Let users enter their existing skills. */}
          <div className="mt-6">
            <label
              htmlFor="userSkills"
              className="mb-3 block text-lg font-semibold"
            >
              Your Existing Skills
            </label>

            <textarea
              id="userSkills"
              value={userSkills}
              onChange={(event) => setUserSkills(event.target.value)}
              placeholder="Example: React, TypeScript, SQL, Git"
              rows={3}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Separate skills with commas. You can also use semicolons or new
              lines.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Analyzing..." : "Analyze Job"}
          </button>

          {loading && (
            <p role="status" className="mt-4 text-sm text-indigo-300">
              Gemini is analyzing the job description. Please wait...
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
        </section>

        {analysis && (
          <section aria-live="polite" className="mt-8 space-y-6">
            {/* Display the personalized skill matching report. */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Your Skill Match</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Based on the required skills identified by Gemini.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-400">
                    {matchPercentage}%
                  </p>
                  <p className="text-xs text-slate-400">
                    Required skills matched
                  </p>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {matchedSkills.length} of {analysis.requiredSkills.length}{" "}
                required skills matched by name.
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-emerald-400">
                    Matching Skills ({matchedSkills.length})
                  </h3>

                  {matchedSkills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-emerald-950 px-3 py-1.5 text-sm text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No exact skill-name matches found.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-amber-400">
                    Skills to Develop ({missingSkills.length})
                  </h3>

                  {missingSkills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-amber-950 px-3 py-1.5 text-sm text-amber-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      All identified required skills matched by name!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-medium text-indigo-400">
                ANALYSIS RESULTS
              </p>

              <h2 className="mt-2 text-2xl font-bold">{analysis.jobTitle}</h2>

              <p className="mt-2 text-sm text-slate-400">
                Experience: {analysis.experienceLevel}
              </p>

              <p className="mt-4 leading-7 text-slate-300">
                {analysis.summary}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-xl font-semibold">Required Skills</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.requiredSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-indigo-800 bg-indigo-950 px-3 py-1.5 text-sm text-indigo-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-xl font-semibold">Key Responsibilities</h3>

                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-300">
                  {analysis.keyResponsibilities.map((responsibility, index) => (
                    <li key={`${responsibility}-${index}`}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">Interview Questions</h3>

              <div className="mt-5 space-y-4">
                {analysis.interviewQuestions.map((item, index) => (
                  <div
                    key={`${item.question}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="font-medium">
                      {index + 1}. {item.question}
                    </p>

                    <span className="mt-3 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
