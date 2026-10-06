/*Page that is visible on local host initially*/

// function Home() - This creates a React component called Home.
export default function Home() {
  // This is the main page of our JobPilot application.
  // In Next.js, app/page.tsx represents the "/" route.
  return (
    <main>
      {/* Main heading displayed on the homepage */}
      <h1>JobPilot</h1>

      {/* Short description of our application */}
      <p>AI-Powered Job Application Tracker</p>
<p>Track your applications. Analyze jobs. Get hired.</p>  
    </main>
  );
}

// // - js/ts comments
// {/* */} - jsx/tsx comments
