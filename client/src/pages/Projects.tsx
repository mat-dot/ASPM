import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const createMutation = trpc.projects.create.useMutation();
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    cicdProvider: "github" as const,
  });

  const handleCreate = async () => {
    if (!newProject.name) return;
    try {
      await createMutation.mutateAsync(newProject);
      setNewProject({ name: "", description: "", repositoryUrl: "", cicdProvider: "github" });
      refetch();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage applications and CI/CD integration</p>
        </div>

        {/* Create Project Form */}
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            />
            <Input
              placeholder="Repository URL"
              value={newProject.repositoryUrl}
              onChange={(e) => setNewProject({ ...newProject, repositoryUrl: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            />
          </div>
          <Input
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full mb-4 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
          />
          <Button onClick={handleCreate} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </Card>

        {/* Projects List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center text-slate-500">Loading projects...</Card>
          ) : projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <Card
                key={project.id}
                className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {project.repositoryUrl && (
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Repository
                        </a>
                      )}
                      <span>Risk Score: {project.riskScore || 0}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-slate-500">
              No projects yet. Create one to get started.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
