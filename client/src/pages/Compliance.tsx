import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Compliance() {
  const { data: controls, isLoading, refetch } = trpc.compliance.controls.useQuery();
  const updateMutation = trpc.compliance.updateStatus.useMutation();

  const handleUpdateStatus = async (id: number, status: "conforme" | "não conforme" | "em progresso") => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success("Status atualizado");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "conforme":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "não conforme":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "em progresso":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "conforme":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "não conforme":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      case "em progresso":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "conforme":
        return "text-green-700 dark:text-green-300";
      case "não conforme":
        return "text-red-700 dark:text-red-300";
      case "em progresso":
        return "text-yellow-700 dark:text-yellow-300";
      default:
        return "";
    }
  };

  // Note: This is a simplified view showing controls without application-specific status
  // In production, you would need to fetch application-specific compliance status
  const conformanceStats = controls
    ? {
        total: controls.length,
        conforme: 0,
        naoConforme: 0,
        emProgresso: controls.length,
      }
    : { total: 0, conforme: 0, naoConforme: 0, emProgresso: 0 };

  const conformancePercentage =
    conformanceStats.total > 0
      ? Math.round((conformanceStats.conforme / conformanceStats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Painel de <span className="blueprint-accent">Conformidade</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Acompanhe o status de conformidade com OWASP Top 10 e CWE
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="blueprint-card">
            <div className="text-center">
              <div className="blueprint-metric-value text-3xl text-cyan-600">
                {conformancePercentage}%
              </div>
              <div className="blueprint-metric-label">Conformidade Geral</div>
            </div>
          </Card>
          <Card className="blueprint-card">
            <div className="text-center">
              <div className="blueprint-metric-value text-3xl text-green-600">
                {conformanceStats.conforme}
              </div>
              <div className="blueprint-metric-label">Conforme</div>
            </div>
          </Card>
          <Card className="blueprint-card">
            <div className="text-center">
              <div className="blueprint-metric-value text-3xl text-yellow-600">
                {conformanceStats.emProgresso}
              </div>
              <div className="blueprint-metric-label">Em Progresso</div>
            </div>
          </Card>
          <Card className="blueprint-card">
            <div className="text-center">
              <div className="blueprint-metric-value text-3xl text-red-600">
                {conformanceStats.naoConforme}
              </div>
              <div className="blueprint-metric-label">Não Conforme</div>
            </div>
          </Card>
        </div>

        {/* Controls List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="blueprint-card animate-pulse h-24" />
            ))}
          </div>
        ) : controls && controls.length > 0 ? (
          <div className="space-y-4">
            {controls.map((control: any) => (
              <Card
                key={control.id}
                className="blueprint-card border-2 transition-all border-cyan-400/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {control.name}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {control.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {control.description}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleUpdateStatus(control.id, "conforme")}
                    >
                      ✓ Conforme
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => handleUpdateStatus(control.id, "em progresso")}
                    >
                      ⏳ Progresso
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleUpdateStatus(control.id, "não conforme")}
                    >
                      ✕ Não Conforme
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="blueprint-card text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum controle de conformidade disponível
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
