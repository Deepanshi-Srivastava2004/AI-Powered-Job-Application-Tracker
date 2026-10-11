
async function main() {
  // Send a POST request to our JobPilot API.
  const response = await fetch(
    "http://localhost:3000/api/applications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: "Google",
        jobTitle: "Frontend Developer",
        jobDescription: "Build and maintain user interfaces.",
        jobUrl: "https://careers.google.com/",
        notes: "Temporary test application for JobPilot.",
      }),
    }
  );

  // Read the response returned by our API.
  const result = await response.json();

  console.log("HTTP status:", response.status);
  console.log("Response:", result);
}

// Run the test function.
main().catch((error) => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});
