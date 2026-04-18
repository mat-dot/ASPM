import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, BarChart3, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-cyan-400/20">
              <Shield className="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>

          <h1 className="text-5xl font-black mb-4 text-slate-900 dark:text-white">
            ASPM <span className="blueprint-accent">Inteligente</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Gerenciamento centralizado de postura de segurança de aplicações com análise inteligente por IA
          </p>

          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="blueprint-metric">
              <BarChart3 className="w-6 h-6 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
              <div className="blueprint-metric-label">Dashboard</div>
            </div>
            <div className="blueprint-metric">
              <AlertCircle className="w-6 h-6 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
              <div className="blueprint-metric-label">Vulnerabilidades</div>
            </div>
            <div className="blueprint-metric">
              <TrendingUp className="w-6 h-6 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
              <div className="blueprint-metric-label">Análise com IA</div>
            </div>
          </div>

          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8">
              Entrar com Manus
            </Button>
          </a>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            <span className="formula-text">Plataforma de Segurança Inteligente</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">
            Dashboard <span className="blueprint-accent">ASPM</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Bem-vindo, {user?.name || "usuário"}
          </p>
        </div>

        {/* Metrics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="blueprint-metric animate-pulse h-32" />
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="blueprint-card">
              <div className="text-center">
                <div className="blueprint-metric-value">{metrics.totalApps}</div>
                <div className="blueprint-metric-label">Aplicações</div>
              </div>
            </Card>

            <Card className="blueprint-card">
              <div className="text-center">
                <div className="blueprint-metric-value text-red-600 dark:text-red-400">
                  {metrics.vulnerabilities.critica}
                </div>
                <div className="blueprint-metric-label">Críticas</div>
              </div>
            </Card>

            <Card className="blueprint-card">
              <div className="text-center">
                <div className="blueprint-metric-value text-orange-600 dark:text-orange-400">
                  {metrics.vulnerabilities.alta}
                </div>
                <div className="blueprint-metric-label">Altas</div>
              </div>
            </Card>

            <Card className="blueprint-card">
              <div className="text-center">
                <div className="blueprint-metric-value text-cyan-600 dark:text-cyan-400">
                  {metrics.riskScore.toFixed(1)}
                </div>
                <div className="blueprint-metric-label">Score Médio</div>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/applications">
            <a>
              <Card className="blueprint-card hover:shadow-lg transition-all cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Aplicações
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Gerenciar ativos monitorados
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/vulnerabilities">
            <a>
              <Card className="blueprint-card hover:shadow-lg transition-all cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Vulnerabilidades
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Registrar e analisar riscos
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/chat">
            <a>
              <Card className="blueprint-card hover:shadow-lg transition-all cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Chat de Segurança
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Consultar com IA
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/compliance">
            <a>
              <Card className="blueprint-card hover:shadow-lg transition-all cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Conformidade
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      OWASP Top 10 e CWE
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </Card>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
