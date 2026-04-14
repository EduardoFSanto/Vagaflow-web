"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from "@/services/job.service";

type Job = {
  id: string;
  title: string;
  description: string;
  salary?: number;
  location: string;
  remote: boolean;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: "OPEN" | "CLOSED" | "PAUSED";
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
};

const typeLabel = {
  FULL_TIME: "Tempo integral",
  PART_TIME: "Meio período",
  CONTRACT: "Contrato",
};

const statusConfig = {
  OPEN: { label: "Aberta", color: "bg-green-50 text-green-600" },
  PAUSED: { label: "Pausada", color: "bg-yellow-50 text-yellow-600" },
  CLOSED: { label: "Fechada", color: "bg-zinc-100 text-zinc-500" },
};

const jobSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(20, "Mínimo 20 caracteres"),
  location: z.string().min(3, "Mínimo 3 caracteres"),
  salary: z.number().positive("Deve ser positivo").optional(),
  remote: z.boolean(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
});

type JobForm = z.infer<typeof jobSchema>;

export default function JobOffersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      remote: false,
      type: "FULL_TIME",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedName = localStorage.getItem("@vagaflow:name");
    const storedRole = localStorage.getItem("@vagaflow:role");

    if (!token || storedRole !== "COMPANY") {
      router.push("/dashboard");
      return;
    }

    if (storedName) setUserName(storedName);

    loadJobs();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadJobs() {
    try {
      const data = await getCompanyJobs();
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingJob(null);
    form.reset({
      title: "",
      description: "",
      location: "",
      remote: false,
      type: "FULL_TIME",
    });
    setModalOpen(true);
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    form.reset({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      remote: job.remote,
      type: job.type,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: JobForm) {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, data);
        toast.success("Vaga atualizada!");
      } else {
        await createJob(data);
        toast.success("Vaga criada!");
      }
      setModalOpen(false);
      loadJobs();
    } catch {
      toast.error("Erro ao salvar vaga");
    }
  }

  async function handleDelete(id: string) {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    try {
      await deleteJob(id);
      toast.success("Vaga deletada!");
      setDeletingId(null);
      loadJobs();
    } catch {
      toast.error("Erro ao deletar vaga");
    }
  }

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400 text-sm">Carregando vagas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="font-bold text-zinc-900 text-xl tracking-tight"
          >
            Vaga<span className="text-blue-600">flow</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-zinc-100 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {userName}
                  </p>
                  <p className="text-xs text-zinc-400">Empresa</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Meu perfil
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("@vagaflow:token");
                    localStorage.removeItem("@vagaflow:role");
                    localStorage.removeItem("@vagaflow:name");
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-50 transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero */}
        <div className="mb-12 border-b border-zinc-100 pb-10 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-400 uppercase tracking-widest mb-2">
              Empresa
            </p>
            <h1 className="text-4xl font-bold text-zinc-900">Minhas vagas</h1>
            <p className="text-zinc-400 mt-2 text-base">
              {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} publicada
              {jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
          >
            + Nova vaga
          </button>
        </div>

        {/* Lista */}
        {jobs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-sm">
              Você ainda não publicou nenhuma vaga.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 text-sm text-zinc-900 font-medium underline underline-offset-4"
            >
              Criar primeira vaga
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="py-6 flex items-start justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-zinc-900 font-semibold text-base">
                      {job.title}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[job.status].color}`}
                    >
                      {statusConfig[job.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                      {job.location}
                    </span>
                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                      {typeLabel[job.type]}
                    </span>
                    {job.remote && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">
                        Remoto
                      </span>
                    )}
                    {job.salary && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                        R$ {job.salary.toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(job)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 text-sm rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      deletingId === job.id
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "border border-red-200 text-red-500 hover:bg-red-50"
                    }`}
                  >
                    {deletingId === job.id ? "Confirmar" : "Deletar"}
                  </button>
                  {deletingId === job.id && (
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-sm text-zinc-400 hover:text-zinc-900"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              {editingJob ? "Editar vaga" : "Nova vaga"}
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Título
                </label>
                <input
                  placeholder="Ex: Desenvolvedor Frontend"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva a vaga..."
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Localização
                  </label>
                  <input
                    placeholder="São Paulo, SP"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Salário (opcional)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    {...form.register("salary", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Tipo
                  </label>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    {...form.register("type")}
                  >
                    <option value="FULL_TIME">Tempo integral</option>
                    <option value="PART_TIME">Meio período</option>
                    <option value="CONTRACT">Contrato</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="remote"
                    className="w-4 h-4 accent-zinc-900"
                    {...form.register("remote")}
                  />
                  <label htmlFor="remote" className="text-sm text-zinc-700">
                    Remoto
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 text-sm rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  {form.formState.isSubmitting
                    ? "Salvando..."
                    : editingJob
                      ? "Salvar alterações"
                      : "Criar vaga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
