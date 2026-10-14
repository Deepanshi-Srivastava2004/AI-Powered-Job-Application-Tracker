"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Defines the structure of one application.
type Application = {
  id: number;
  company: string;
  jobTitle: string;
  status: string;
  applicationDate: string;
  jobDescription?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
};

type ApplicationsResponse = {
  success: boolean;
  data?: Application;
  message?: string;
};

const applicationStatuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredApplications = applications.filter((application) => {
    // Check whether the company or job title matches the search.
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      application.company.toLowerCase().includes(search) ||
      application.jobTitle.toLowerCase().includes(search);

    // Check whether the selected status matches the application.
    const matchesStatus =
      statusFilter === "ALL" || application.status === statusFilter;

    // Show an application only when both conditions match.
    return matchesSearch && matchesStatus;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Tracks which application is currently being edited.
  const [editingId, setEditingId] = useState<number | null>(null);

  // Stores the editable form fields.
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    jobDescription: "",
    jobUrl: "",
    notes: "",
  });

  // Fetch all saved applications when the page opens.
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load applications.");
        }

        setApplications(result.data ?? []);
      } catch (err) {
        console.error("Applications fetch error:", err);
        setError("Could not load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Update an application's status using the PATCH API.
  async function handleStatusChange(applicationId: number, newStatus: string) {
    setUpdatingId(applicationId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update status.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application,
        ),
      );

      setMessage("Application status updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Open the edit form and fill it with the existing application details.
  function handleEdit(application: Application) {
    setEditingId(application.id);

    setFormData({
      company: application.company,
      jobTitle: application.jobTitle,
      jobDescription: application.jobDescription ?? "",
      jobUrl: application.jobUrl ?? "",
      notes: application.notes ?? "",
    });

    setMessage("");
    setError("");
  }

  // Send the edited details to the PUT API.
  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null) return;

    setUpdatingId(editingId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/applications/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save changes.");
      }

      // Update the displayed application with the saved data.
      setApplications((current) =>
        current.map((application) =>
          application.id === editingId
            ? { ...application, ...result.data }
            : application,
        ),
      );

      setEditingId(null);
      setMessage("Application details updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete an application after the user confirms.
  async function handleDelete(applicationId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application? This action cannot be undone.",
    );

    if (!confirmed) return;

    setUpdatingId(applicationId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete application.");
      }

      // Remove the deleted application from the page.
      setApplications((current) =>
        current.filter((application) => application.id !== applicationId),
      );

      if (editingId === applicationId) {
        setEditingId(null);
      }

      setMessage("Application deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete application.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              My Applications
            </h1>

            <button
              onClick={() => router.push("/applications/new")}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              + Add Application
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search and filter controls */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          {/* Search by company or job title */}
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          {/* Filter applications by status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-56"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-6 rounded-lg bg-green-50 p-4 text-green-700"
          >
            {message}
          </p>
        )}

        {loading && (
          <p className="mt-8 rounded-lg border bg-white p-5 text-gray-600">
            Loading your applications...
          </p>
        )}

        {!loading && applications.length === 0 && (
          <div className="mt-8 rounded-xl border bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">No applications yet</h2>
            <p className="mt-2 text-gray-600">
              Add your first job application to start tracking your progress.
            </p>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <section className="mt-8 space-y-4">
            <p className="text-sm text-gray-500">
              {filteredApplications.length} application
              {filteredApplications.length === 1 ? "" : "s"} found
            </p>

            {filteredApplications.length === 0 ? (
              <div className="rounded-xl border bg-white p-8 text-center">
                <h2 className="text-lg font-semibold">
                  No matching applications
                </h2>
                <p className="mt-2 text-gray-600">
                  Try another search term or select a different status.
                </p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {application.jobTitle}
                      </h2>
                      <p className="mt-1 text-gray-600">
                        {application.company}
                      </p>
                      <p className="mt-3 text-sm text-gray-500">
                        Applied on:{" "}
                        {new Date(
                          application.applicationDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor={`status-${application.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Application Status
                      </label>

                      <select
                        id={`status-${application.id}`}
                        value={application.status}
                        disabled={updatingId === application.id}
                        onChange={(event) =>
                          handleStatusChange(application.id, event.target.value)
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {applicationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {editingId === application.id ? (
                    <form onSubmit={handleSaveEdit} className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">
                        Edit Application
                      </h3>

                      <div>
                        <label
                          htmlFor="edit-company"
                          className="mb-1 block text-sm font-medium"
                        >
                          Company Name *
                        </label>
                        <input
                          id="edit-company"
                          required
                          value={formData.company}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              company: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-title"
                          className="mb-1 block text-sm font-medium"
                        >
                          Job Title *
                        </label>
                        <input
                          id="edit-title"
                          required
                          value={formData.jobTitle}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              jobTitle: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-description"
                          className="mb-1 block text-sm font-medium"
                        >
                          Job Description
                        </label>
                        <textarea
                          id="edit-description"
                          rows={4}
                          value={formData.jobDescription}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              jobDescription: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-url"
                          className="mb-1 block text-sm font-medium"
                        >
                          Job Posting URL
                        </label>
                        <input
                          id="edit-url"
                          type="url"
                          value={formData.jobUrl}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              jobUrl: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-notes"
                          className="mb-1 block text-sm font-medium"
                        >
                          Notes
                        </label>
                        <textarea
                          id="edit-notes"
                          rows={3}
                          value={formData.notes}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              notes: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={updatingId === application.id}
                          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {updatingId === application.id
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {application.jobDescription && (
                        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-600">
                          {application.jobDescription}
                        </p>
                      )}

                      {application.jobUrl && (
                        <a
                          href={application.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block break-all text-sm text-blue-600 hover:underline"
                        >
                          View Job Posting ↗
                        </a>
                      )}

                      {application.notes && (
                        <p className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span>{" "}
                          {application.notes}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(application)}
                          disabled={updatingId === application.id}
                          className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(application.id)}
                          disabled={updatingId === application.id}
                          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {updatingId === application.id
                            ? "Please wait..."
                            : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}
