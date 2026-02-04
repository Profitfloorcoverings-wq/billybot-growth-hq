import LeadsDashboard from "@/components/LeadsDashboard";

export default function Home() {
  return (
    <main className="min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">BillyBot Growth HQ</h1>
          <p className="text-sm text-gray-600">
            UK only • Drafts only until you type “send batch”
          </p>
        </div>

        <LeadsDashboard />

        <div className="mt-10 text-xs text-gray-500">
          Tip: this app reads the repo files directly. Update:
          <ul className="list-disc ml-5 mt-2">
            <li>ops/daily-brief.md</li>
            <li>leads/queue-to-send.csv</li>
            <li>leads/flooring-leads.csv</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
