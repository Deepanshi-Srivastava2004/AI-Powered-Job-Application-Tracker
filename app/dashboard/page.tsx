"use client";

import { useEffect, useState } from "react";

// Defines the structure of one job application.
type Application = {
  id: number;
  company: string;
  jobTitle: string;
  status: string;
  applicationDate: string;
  createdAt: string;
};

// Defines the response returned by our API.
type ApplicationsResponse = {
  success: boolean;
  data?: Application[];
  message?: string;
};

export default function DashboardPage() {
  // Stores applications fetched from the database.
  const [applications, setApplications] = useState<Application[]>([]);

  // Tracks whether data is loading.
  const [loading, setLoading] = useState(true);

  // Stores any error message.
  const [error, setError] = useState("");

  // Fetch applications when the dashboard opens.
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications");
        const result: ApplicationsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch applications.");
        }

        // Save the API data so React can display it.
        setApplications(result.data ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Calculate summary counts from the fetched applications.
  const totalApplications = applications.length;

  // Show only the five most recently created applications.
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const appliedCount = applications.filter(
    (app) => app.status.toUpperCase() === "APPLIED",
  ).length;

  const interviewCount = applications.filter(
    (app) => app.status.toUpperCase() === "INTERVIEW",
  ).length;

  const offerCount = applications.filter(
    (app) => app.status.toUpperCase() === "OFFER",
  ).length;

  // Count applications that have been rejected.
  const rejectedCount = applications.filter(
    (app) => app.status.toUpperCase() === "REJECTED",
  ).length;

  // Calculate the percentage of applications that resulted in offers.
  const offerRate =
    totalApplications === 0
      ? 0
      : Math.round((offerCount / totalApplications) * 100);

  // Display a loading message while fetching data.
  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">JobPilot Dashboard</h1>
        <p className="mt-4">Loading your applications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-8">
      <h1 className="text-3xl font-bold">JobPilot Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Track and manage your job applications in one place.
      </p>

      {/* Display any error returned while loading applications. */}
      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {/* Four summary cards with dynamically calculated counts. */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="mt-2 text-3xl font-bold">{totalApplications}</p>
          <p className="mt-2 text-sm text-gray-500">All tracked applications</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Applied</p>
          <p className="mt-2 text-3xl font-bold">{appliedCount}</p>
          <p className="mt-2 text-sm text-gray-500">Applications submitted</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Interviews</p>
          <p className="mt-2 text-3xl font-bold">{interviewCount}</p>
          <p className="mt-2 text-sm text-gray-500">Interview stage</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Offers</p>
          <p className="mt-2 text-3xl font-bold">{offerCount}</p>
          <p className="mt-2 text-sm text-gray-500">Offers received</p>
        </div>
        {/* Rejected applications card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="mt-2 text-3xl font-bold">{rejectedCount}</p>
          <p className="mt-2 text-sm text-gray-500">Applications rejected</p>
        </div>

        {/* Offer rate card */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Offer Rate</p>
          <p className="mt-2 text-3xl font-bold">{offerRate}%</p>
          <p className="mt-2 text-sm text-gray-500">
            Applications resulting in offers
          </p>
        </div>
      </section>

      {/* List the applications fetched from the database. */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Recent Applications</h2>

        {applications.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No applications found. Add your first application!
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {recentApplications.map((application) => (
              <article
                key={application.id}
                className="rounded-xl border p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {application.jobTitle}
                    </h3>
                    <p className="mt-1 text-gray-600">{application.company}</p>
                  </div>

                  <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {application.status}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Applied on:{" "}
                  {new Date(application.applicationDate).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
