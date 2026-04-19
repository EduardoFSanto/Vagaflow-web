"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from "@/services/job.service";

type Question = {
  id: string;
  prompt: string;
  type: "SHORT_TEXT" | "LONG_TEXT" | "YES_NO";
  required: boolean;
  order: number;
};

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
  questions: Question[];
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

const questionSchema = z.object({
  prompt: z.string().min(10, "Pergunta deve ter no mínimo 10 caracteres"),
  type: z.enum(["SHORT_TEXT", "LONG_TEXT", "YES_NO"]),
  required: z.boolean(),
});

const jobSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(20, "Mínimo 20 caracteres"),
  location: z.string().min(3, "Mínimo 3 caracteres"),
  salary: z.number().positive("Deve ser positivo").optional(),
  remote: z.boolean(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  questions: z.array(questionSchema).max(8, "Máximo de 8 perguntas"),
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
      questions: [],
    },
  });

  const questionFieldArray = useFieldArray({
    control: form.control,
    name: "questions",
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
      questions: [],
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
      questions: (job.questions ?? []).map((question) => ({
        prompt: question.prompt,
        type: question.type,
        required: question.required,
      })),
    });
    setModalOpen(true);
  }

  async function onSubmit(data: JobForm) {
    try {
      const payload = {
        ...data,
        questions: data.questions.map((question) => ({
          prompt: question.prompt.trim(),
          type: question.type,
          required: question.required,
        })),
      };

      if (editingJob) {
        await updateJob(editingJob.id, payload);
        toast.success("Vaga atualizada!");
      } else {
        await createJob(payload);
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex items-end md:justify-start">
                  <label className="flex items-center gap-3 text-sm text-zinc-700 pt-1">
                    <input
                      type="checkbox"
                      id="remote"
                      className="w-4 h-4 accent-zinc-900"
                      {...form.register("remote")}
                    />
                    Remoto
                  </label>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-100 pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">
                      Perguntas de triagem
                    </p>
                    <p className="text-xs text-zinc-400">
                      Faça perguntas extras para avaliar melhor os candidatos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      questionFieldArray.append({
                        prompt: "",
                        type: "SHORT_TEXT",
                        required: false,
                      })
                    }
                    className="px-3 py-1.5 border border-zinc-200 text-zinc-600 text-xs rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-colors w-full sm:w-auto"
                  >
                    + Nova pergunta
                  </button>
                </div>

                {questionFieldArray.fields.length === 0 ? (
                  <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg p-3">
                    Sem perguntas extras. Você pode publicar assim, mas incluir
                    2 ou 3 perguntas costuma melhorar a qualidade da seleção.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {questionFieldArray.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="border border-zinc-200 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-zinc-500">
                            Pergunta {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => questionFieldArray.remove(index)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Remover
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Ex: Conte um projeto em que você melhorou performance de uma aplicação"
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                          {...form.register(`questions.${index}.prompt`)}
                        />
                        {form.formState.errors.questions?.[index]?.prompt && (
                          <p className="text-xs text-red-500">
                            {
                              form.formState.errors.questions[index]?.prompt
                                ?.message as string
                            }
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-600">
                              Tipo de resposta
                            </label>
                            <select
                              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                              {...form.register(`questions.${index}.type`)}
                            >
                              <option value="SHORT_TEXT">Texto curto</option>
                              <option value="LONG_TEXT">Texto longo</option>
                              <option value="YES_NO">Select Sim/Não</option>
                            </select>
                          </div>

                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm text-zinc-600">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-zinc-900"
                                {...form.register(
                                  `questions.${index}.required`,
                                )}
                              />
                              Pergunta obrigatória
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
