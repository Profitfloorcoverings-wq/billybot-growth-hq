"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { marked } from "marked";

type QueueRow = {
  business_name?: string;
  first_name?: string;
  role?: string;
  email?: string;
  subject?: string;
  body?: string;
  status?: string;
};

type LeadRow = {
  business_name?: string;
  city?: string;
  postcode?: string;
  website?: string;
  phone?: string;
  email?: string;
  google_maps_url?: string;
  notes?: string;
  status?: string;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function LeadsDashboard() {
  const [dailyBriefMd, setDailyBriefMd] = useState<string>("Loading...");
  const [queueCsv, setQueueCsv] = useState<string>("");
  const [leadsCsv, setLeadsCsv] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<QueueRow | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setErr(null);
        const [brief, queue, leads] = await Promise.all([
          fetch("/data/ops/daily-brief.md").then((r) => r.text()),
          fetch("/data/leads/queue-to-send.csv").then((r) => r.text()),
          fetch("/data/leads/flooring-leads.csv").then((r) => r.text()),
        ]);
        setDailyBriefMd(brief);
        setQueueCsv(queue);
        setLeadsCsv(leads);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    }
    load();
  }, []);

  const briefHtml = useMemo(() => {
    try {
      return marked.parse(dailyBriefMd ?? "");
    } catch {
      return `<pre>${dailyBriefMd}</pre>`;
    }
  }, [dailyBriefMd]);

  const queueRows = useMemo(() => {
    if (!queueCsv.trim()) return [] as QueueRow[];
    const parsed = Papa.parse<QueueRow>(queueCsv, { header: true, skipEmptyLines: true });
    return parsed.data ?? [];
  }, [queueCsv]);

  const leadsRows = useMemo(() => {
    if (!leadsCsv.trim()) return [] as LeadRow[];
    const parsed = Papa.parse<LeadRow>(leadsCsv, { header: true, skipEmptyLines: true });
    return parsed.data ?? [];
  }, [leadsCsv]);

  const queueReadyCount = useMemo(() => {
    return queueRows.filter((r) => (r.email ?? "").includes("@") && (r.subject ?? "").trim() && (r.body ?? "").trim()).length;
  }, [queueRows]);

  const leadsCount = leadsRows.length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Daily brief">
          {err ? (
            <div className="text-sm text-red-600">Error loading files: {err}</div>
          ) : (
            <article
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: briefHtml as string }}
            />
          )}
        </Card>

        <Card title={`Queue to send (drafts) — ${queueReadyCount} ready`}>
          <div className="text-sm text-gray-600 mb-3">
            Nothing sends automatically. When you type “send batch”, we’ll send whatever is marked ready.
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-2">View</th>
                </tr>
              </thead>
              <tbody>
                {queueRows.slice(0, 25).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4">{r.business_name}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">{r.subject}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                    <td className="py-2 pr-2">
                      <button
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        onClick={() => {
                          setSelectedDraft(r);
                          setCopied(null);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {queueRows.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={5}>
                      Queue is empty.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {queueRows.length > 25 ? (
            <div className="mt-3 text-xs text-gray-500">Showing first 25 rows.</div>
          ) : null}

          {selectedDraft ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setSelectedDraft(null)}
            >
              <div
                className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div>
                    <div className="text-sm text-gray-600">Draft email</div>
                    <div className="text-lg font-semibold">{selectedDraft.business_name}</div>
                    <div className="mt-1 text-xs text-gray-600">{selectedDraft.email}</div>
                  </div>
                  <button
                    className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                    onClick={() => setSelectedDraft(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-600">Subject</div>
                    <div className="mt-1 rounded-lg bg-gray-50 p-3 text-sm">{selectedDraft.subject}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600">Body</div>
                    <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm leading-6">
                      {selectedDraft.body}
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={async () => {
                        const text = `Subject: ${selectedDraft.subject}\n\n${selectedDraft.body ?? ""}`;
                        await navigator.clipboard.writeText(text);
                        setCopied("Copied subject+body");
                        setTimeout(() => setCopied(null), 1200);
                      }}
                    >
                      Copy subject + body
                    </button>
                    <button
                      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={async () => {
                        await navigator.clipboard.writeText(selectedDraft.email ?? "");
                        setCopied("Copied email");
                        setTimeout(() => setCopied(null), 1200);
                      }}
                    >
                      Copy email
                    </button>
                    {copied ? <div className="self-center text-xs text-green-700">{copied}</div> : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Snapshot">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Leads</div>
              <div className="text-2xl font-semibold">{leadsCount}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Drafts ready</div>
              <div className="text-2xl font-semibold">{queueReadyCount}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            UK only • Free tier target: 10 quotes • Paywall after 10
          </div>
        </Card>

        <Card title="Leads (first 20)">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-3">Business</th>
                  <th className="py-2 pr-3">City</th>
                  <th className="py-2 pr-3">Maps</th>
                </tr>
              </thead>
              <tbody>
                {leadsRows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3">{r.business_name}</td>
                    <td className="py-2 pr-3">{r.city}</td>
                    <td className="py-2 pr-3">
                      {r.google_maps_url ? (
                        <a className="text-blue-600 underline" href={r.google_maps_url} target="_blank" rel="noreferrer">
                          open
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
                {leadsRows.length === 0 ? (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={3}>
                      No leads yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {leadsRows.length > 20 ? (
            <div className="mt-3 text-xs text-gray-500">Showing first 20 rows.</div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
