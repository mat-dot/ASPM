import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Filter } from "lucide-react";

export default function Vulnerabilities() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: vulnerabilities, isLoading } = trpc.vulnerabilities.list.useQuery(
    { projectId: projectId || 0 },
    { enabled: !!projectId }
  );

  const filteredVulns = vulnerabilities?.filter((v: any) => {
    if (severityFilter && v.severity !== severityFilter) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    return true;
  });

  const severityColors: Record<string, string> = {
    crítica: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    alta: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    baixa: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Vulnerabilities
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and prioritize security findings
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project
              </label>
              <select
                value={projectId || ""}
                onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Select a project...</option>
                {projects?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Severity
              </label>
              <select
                value={severityFilter || ""}
                onChange={(e) => setSeverityFilter(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">All severities</option>
                <option value="crítica">Critical</option>
                <option value="alta">High</option>
                <option value="média">Medium</option>
                <option value="baixa">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">All statuses</option>
                <option value="aberta">Open</option>
                <option value="em remediação">In Remediation</option>
                <option value="resolvida">Resolved</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Vulnerabilities List */}
        <div className="space-y-4">
          {!projectId ? (
            <Card className="p-8 text-center text-slate-500">
              Select a project to view vulnerabilities
            </Card>
          ) : isLoading ? (
            <Card className="p-8 text-center text-slate-500">Loading vulnerabilities...</Card>
          ) : filteredVulns && filteredVulns.length > 0 ? (
            filteredVulns.map((vuln: any) => (
              <Card
                key={vuln.id}
                className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {vuln.title}
                      </h3>
                      {vuln.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-3">{vuln.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            severityColors[vuln.severity] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vuln.severity}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                          {vuln.status}
                        </span>
                        {vuln.cveId && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                            {vuln.cveId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Analyze
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-slate-500">
              No vulnerabilities found
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
