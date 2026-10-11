
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
        throw new Error(
          result.message || "Could not save the application.",
        );
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="mb-6 rounded-lg border bg-white px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Applications
        </button>

        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Application
          </h1>

          <p className="mt-2 text-gray-600">
            Keep track of a job opportunity you're applying for.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-red-700"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="company"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Company Name *
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="jobTitle"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Job Title *
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="jobUrl"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Application"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/applications")}
                className="rounded-lg border px-6 py-3 font-medium hover:bg-gray-50"
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
