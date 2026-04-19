import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Shield, AlertCircle, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            ASPM Enterprise
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Application Security Posture Management for SDLC
          </p>
        </div>

        {/* Metrics */}
        {!isLoading && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(metrics as any).totalProjects || 0}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-cyan-600" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilities</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(metrics as any).totalVulnerabilities || 0}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(metrics as any).severityCounts?.crítica || 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Risk Score</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(metrics as any).riskScore || (metrics as any).averageRiskScore || 0}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-cyan-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <Shield className="w-10 h-10 text-cyan-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Projects
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Manage applications and CI/CD integration
            </p>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/projects")}>
              View Projects
            </Button>
          </Card>

          <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <AlertCircle className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Vulnerabilities
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Track and prioritize security findings
            </p>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/vulnerabilities")}>
              View Findings
            </Button>
          </Card>

          <Card className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <Zap className="w-10 h-10 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Scans
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Orchestrate SAST/DAST scans (Semgrep + Burp)
            </p>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/scans")}>
              Run Scan
            </Button>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Key Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              SAST Integration (Semgrep)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              DAST Integration (Burp Suite)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              AI-powered Risk Prioritization
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              Credential Leak Detection
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              Prompt Injection Protection
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
              CI/CD Pipeline Integration
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
