import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Vulnerabilities() {
  const { data: vulnerabilities, isLoading, refetch } = trpc.vulnerabilities.list.useQuery({ applicationId: undefined });
  const { data: applications } = trpc.applications.list.useQuery();
  const createMutation = trpc.vulnerabilities.create.useMutation();
  const analyzeMutation = trpc.vulnerabilities.analyze.useMutation();
  const deleteMutation = trpc.vulnerabilities.delete.useMutation();
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | any>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const filteredVulnerabilities = vulnerabilities?.filter((v) => {
    const matchSeverity = !filterSeverity || v.severity === filterSeverity;
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSeverity && matchStatus;
  });

  const [formData, setFormData] = useState({
    applicationId: 0,
    title: "",
    description: "",
    severity: "média" as const,
    cve: "",
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Vulnerabilidade registrada com sucesso");
      setFormData({ applicationId: 0, title: "", description: "", severity: "média", cve: "" });
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao registrar vulnerabilidade");
    }
  };

  const handleAnalyze = async (vulnId: number) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMutation.mutateAsync({ id: vulnId });
      setAnalysis(typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis));
      setAnalysisOpen(true);
    } catch (error) {
      toast.error("Erro ao analisar vulnerabilidade");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "crítica":
        return "severity-critica";
      case "alta":
        return "severity-alta";
      case "média":
        return "severity-media";
      case "baixa":
        return "severity-baixa";
      default:
        return "text-slate-600";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "aberta":
        return "status-aberta";
      case "em remediação":
        return "status-em-remediacao";
      case "resolvida":
        return "status-resolvida";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Vulnerabilidades <span className="blueprint-accent">Registradas</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gerencie e analise vulnerabilidades com IA
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vulnerabilidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Vulnerabilidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="app">Aplicação</Label>
                  <select
                    id="app"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: parseInt(e.target.value) })}
                  >
                    <option value={0}>Selecione uma aplicação</option>
                    {applications?.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: SQL Injection em formulário de login"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severidade</Label>
                  <select
                    id="severity"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    <option value="crítica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="média">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="cve">CVE (opcional)</Label>
                  <Input
                    id="cve"
                    placeholder="Ex: CVE-2024-1234"
                    value={formData.cve}
                    onChange={(e) => setFormData({ ...formData, cve: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    placeholder="Descreva a vulnerabilidade"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={!formData.title || formData.applicationId === 0}
                >
                  Registrar Vulnerabilidade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analysis Dialog */}
        <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Análise com IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin mr-2">⚙️</div>
                  <span>Analisando vulnerabilidade...</span>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <Streamdown>{analysis}</Streamdown>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="filter-severity">Filtrar por Severidade</Label>
            <select
              id="filter-severity"
              className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="crítica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="média">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="filter-status">Filtrar por Status</Label>
            <select
              id="filter-status"
              className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="em remediação">Em Remediação</option>
              <option value="resolvida">Resolvida</option>
            </select>
          </div>
        </div>

        {/* Vulnerabilities List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="blueprint-card animate-pulse h-24" />
            ))}
          </div>
        ) : filteredVulnerabilities && filteredVulnerabilities.length > 0 ? (
          <div className="space-y-4">
            {filteredVulnerabilities.map((vuln) => (
              <Card key={vuln.id} className="blueprint-card hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white">{vuln.title}</h3>
                      <span className={getSeverityColor(vuln.severity)}>{vuln.severity}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {vuln.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={getStatusClass(vuln.status)}>{vuln.status}</span>
                      {vuln.cve && (
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {vuln.cve}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleAnalyze(vuln.id)}
                      variant="outline"
                      size="sm"
                      disabled={isAnalyzing}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Analisar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={async () => {
                        if (confirm("Tem certeza que deseja deletar esta vulnerabilidade?")) {
                          try {
                            await deleteMutation.mutateAsync({ id: vuln.id });
                            toast.success("Vulnerabilidade deletada");
                            refetch();
                          } catch (error) {
                            toast.error("Erro ao deletar vulnerabilidade");
                          }
                        }
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="blueprint-card text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhuma vulnerabilidade registrada</p>
          </Card>
        )}
      </div>
    </div>
  );
}
