import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Server } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Applications() {
  const { data: applications, isLoading, refetch } = trpc.applications.list.useQuery();
  const createMutation = trpc.applications.create.useMutation();
  const deleteMutation = trpc.applications.delete.useMutation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "web",
    environment: "prod",
    repository: "",
    responsible: "",
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Aplicação criada com sucesso");
      setFormData({ name: "", type: "web", environment: "prod", repository: "", responsible: "" });
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar aplicação");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Aplicações <span className="blueprint-accent">Monitoradas</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gerencie os ativos de sua organização
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Aplicação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Aplicação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: API de Pagamentos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      placeholder="Ex: web, api, mobile"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Ambiente</Label>
                    <Input
                      id="environment"
                      placeholder="Ex: prod, staging"
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="repository">Repositório</Label>
                  <Input
                    id="repository"
                    placeholder="URL do repositório"
                    value={formData.repository}
                    onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input
                    id="responsible"
                    placeholder="Nome do responsável"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={!formData.name}
                >
                  Criar Aplicação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Applications Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="blueprint-card animate-pulse h-48" />
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="blueprint-card hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      <Server className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{app.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Ambiente:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{app.environment}</span>
                  </div>
                  {app.responsible && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Responsável:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{app.responsible}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Score:</span>
                    <span className="blueprint-metric-value text-lg">{app.riskScore || "0"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast.info("Edição em desenvolvimento");
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={async () => {
                      if (confirm("Tem certeza que deseja deletar esta aplicação?")) {
                        try {
                          await deleteMutation.mutateAsync({ id: app.id });
                          toast.success("Aplicação deletada");
                          refetch();
                        } catch (error) {
                          toast.error("Erro ao deletar aplicação");
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="blueprint-card text-center py-12">
            <Server className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhuma aplicação registrada</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Comece adicionando sua primeira aplicação
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
