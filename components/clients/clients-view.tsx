"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpDown, MoreVertical, Edit } from "lucide-react";
import type { ClientWithScore } from "@/lib/data/clients";
import { ClientDialog } from "./client-dialog";

interface ClientsViewProps {
  initialData: ClientWithScore[];
}

export function ClientsView({ initialData }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData); // In real app, initialData is refreshed via router, but local sort/filter is fine

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithScore | null>(
    null
  );

  const filteredData = data.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: ClientWithScore) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-6 flex-shrink-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Clients
            </h2>
            <p className="text-slate-400">
              Manage your portfolio and monitor reputation scores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-4 rounded-lg bg-slate-800 border border-white/10 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                file_download
              </span>
              Export
            </button>
            <button
              onClick={handleAddClient}
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
                add
              </span>
              Add Client
            </button>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-1.5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="bg-slate-900/60 border border-glass-border w-full pl-10 pr-4 h-10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Search clients, industries..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>
          <button className="h-10 px-4 rounded-lg hover:bg-white/5 text-slate-300 text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter className="w-5 h-5 text-slate-400" />
            Filter
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
              2
            </span>
          </button>
          <button className="h-10 px-4 rounded-lg hover:bg-white/5 text-slate-300 text-sm font-medium flex items-center gap-2 transition-colors">
            <ArrowUpDown className="w-5 h-5 text-slate-400" />
            Sort by: Status
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[35%]">
                  Company
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[15%]">
                  Industry
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[15%]">
                  Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[15%]">
                  Last Audit
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[5%] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No clients found. Click "Add Client" to create one.
                  </td>
                </tr>
              ) : (
                filteredData.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white p-1 flex-shrink-0 overflow-hidden">
                          {/* Use Google Favicon Service or database logo_url */}
                          <img
                            alt={`${client.name} logo`}
                            className="h-full w-full object-contain rounded-full"
                            src={
                              client.logo_url ||
                              `https://www.google.com/s2/favicons?domain=${
                                client.website || "example.com"
                              }&sz=64`
                            }
                            onError={(e) => {
                              // Fallback if image fails
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.innerText =
                                client.name.substring(0, 2).toUpperCase();
                              e.currentTarget.parentElement!.classList.add(
                                "flex",
                                "items-center",
                                "justify-center",
                                "font-bold",
                                "text-slate-800"
                              );
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {client.name}
                          </span>
                          {client.website && (
                            <a
                              className="text-xs text-slate-500 hover:text-primary transition-colors"
                              href={client.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {client.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {client.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          client.status === "Monitoring"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : client.status === "Risk"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            client.status === "Monitoring"
                              ? "bg-emerald-500"
                              : client.status === "Risk"
                              ? "bg-amber-500 animate-pulse"
                              : "bg-slate-500"
                          }`}
                        ></span>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.score > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full w-[${
                                client.score
                              }%] rounded-full ${
                                client.score >= 70
                                  ? "bg-emerald-500"
                                  : client.score >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${client.score}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              client.score >= 70
                                ? "text-emerald-500"
                                : client.score >= 40
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {client.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {client.lastAudit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-md bg-primary text-white text-xs font-medium">
              1
            </button>
          </div>
        </div>
      </div>

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={selectedClient}
      />
    </div>
  );
}
