"use client";

import { useEffect, useState } from "react";
import { IoBagRemove } from "react-icons/io5";
import { TiTick } from "react-icons/ti";
import { SlCalender } from "react-icons/sl";
import { FaStar } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { TbAntennaBars5 } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";

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

  // Calculate the percentage of applications that reached
  // the Interview or Offer stage.
  const progressCount = interviewCount + offerCount;

  const jobSearchProgress =
    totalApplications === 0
      ? 0
      : Math.round((progressCount / totalApplications) * 100);

  // Display a loading message while fetching data.
  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Good Morning Deepanshi....</h1>
        <p className="mt-4">Loading your applications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
      <h1 className="text-3xl font-bold text-white">
        Good Morning Deepanshi....
      </h1>

      <p className="mt-2 text-slate-400">
        Track and manage your job applications in one place.
      </p>

      {/* Error Message */}
      {error && (
        <p className="mt-6 rounded-lg border border-red-900 bg-red-950/50 p-4 text-red-300">
          {error}
        </p>
      )}

      {/* Statistics Cards */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Applications */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-950/20">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <IoBagRemove className="text-xl text-indigo-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">
              Total Applications
            </p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">
            {totalApplications}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            All tracked applications
          </p>
        </div>

        {/* Applied */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TiTick className="text-xl text-emerald-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">Applied</p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">{appliedCount}</p>
          <p className="mt-2 text-sm text-slate-400">Applications submitted</p>
        </div>

        {/* Interviews */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <SlCalender className="text-xl text-blue-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">Interviews</p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">{interviewCount}</p>
          <p className="mt-2 text-sm text-slate-400">Interview stage</p>
        </div>

        {/* Offers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FaStar className="text-xl text-amber-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">Offers</p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">{offerCount}</p>
          <p className="mt-2 text-sm text-slate-400">Offers received</p>
        </div>

        {/* Rejected */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <ImCross className="text-xl text-red-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">Rejected</p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">{rejectedCount}</p>
          <p className="mt-2 text-sm text-slate-400">Applications rejected</p>
        </div>

        {/* Offer Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <TbAntennaBars5 className="text-xl text-violet-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">Offer Rate</p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">{offerRate}%</p>
          <p className="mt-2 text-sm text-slate-400">
            Applications resulting in offers
          </p>
        </div>

        {/* Job Search Progress */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:shadow-lg">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
              <FaSearch className="text-xl text-teal-400" />
            </span>
            <p className="text-sm font-medium text-slate-400">
              Job Search Progress
            </p>
          </span>
          <p className="mt-3 text-3xl font-bold text-white">
            {jobSearchProgress}%
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Applications reaching interview or offer stage
          </p>
        </div>
      </section>

      {/* Recent Applications */}
      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold text-white">
            Recent Applications
          </h2>

          <Link
            href="/applications"
            className="text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
          >
            View all applications →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">
            <h3 className="text-lg font-semibold text-white">
              No applications yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Start tracking your job search by adding your first application.
            </p>

            <Link
              href="/applications/new"
              className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              + Add Your First Application
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentApplications.map((application) => {
              const status = application.status.toUpperCase();

              const statusStyles =
                status === "OFFER"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : status === "REJECTED"
                    ? "bg-red-500/10 text-red-400"
                    : status === "INTERVIEW"
                      ? "bg-blue-500/10 text-blue-400"
                      : status === "IN REVIEW"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-indigo-500/10 text-indigo-400";

              return (
                <article
                  key={application.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700 hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {application.jobTitle}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {application.company}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    Applied on:{" "}
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
