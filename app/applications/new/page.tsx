"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage() {
  const router = useRouter();

  // Stores the values entered in the form.
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    jobDescription: "",
    jobUrl: "",
    notes: "",
  });

  // Tracks whether the form is saving.
  const [saving, setSaving] = useState(false);

  // Displays errors if the application cannot be saved.
  const [error, setError] = useState("");

  // Sends the form data to our existing POST API.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save the application.");
      }

      // Return to the list after the application is saved.
      router.push("/applications");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200 sm:px-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          ← Back to Applications
        </button>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/10 sm:p-6 md:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Add New Application
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
            Keep track of a job opportunity you're applying for.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Company Name */}
            <div>
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Company Name <span className="text-red-400">*</span>
              </label>

              <input
                id="company"
                required
                value={formData.company}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    company: event.target.value,
                  })
                }
                placeholder="e.g. Google"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Job Title */}
            <div>
              <label
                htmlFor="jobTitle"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Job Title <span className="text-red-400">*</span>
              </label>

              <input
                id="jobTitle"
                required
                value={formData.jobTitle}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    jobTitle: event.target.value,
                  })
                }
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Job Description */}
            <div>
              <label
                htmlFor="jobDescription"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Job Description
              </label>

              <textarea
                id="jobDescription"
                rows={5}
                value={formData.jobDescription}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    jobDescription: event.target.value,
                  })
                }
                placeholder="Paste the job description here..."
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Job Posting URL */}
            <div>
              <label
                htmlFor="jobUrl"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Job Posting URL
              </label>

              <input
                id="jobUrl"
                type="url"
                value={formData.jobUrl}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    jobUrl: event.target.value,
                  })
                }
                placeholder="https://example.com/jobs/123"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Notes
              </label>

              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    notes: event.target.value,
                  })
                }
                placeholder="Recruiter details, follow-up dates, etc."
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Application"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/applications")}
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
