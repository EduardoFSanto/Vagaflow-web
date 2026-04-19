"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getJobById } from "@/services/job.service";
import { applyToJob } from "@/services/application.service";
import { ApplicationForm } from "@/components/forms/application-form";

type Job = {
  id: string;
  title: string;
  description: string;
  salary?: number;
  location: string;
  remote: boolean;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  status: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    description?: string;
  };
  _count: {
    applications: number;
  };
  questions: {
    id: string;
    prompt: string;
    type: "SHORT_TEXT" | "LONG_TEXT";
    required: boolean;
    order: number;
  }[];
};

const typeLabel = {
  FULL_TIME: "Tempo integral",
  PART_TIME: "Meio período",
  CONTRACT: "Contrato",
};

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedName = localStorage.getItem("@vagaflow:name");
    const storedRole = localStorage.getItem("@vagaflow:role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);

    async function load() {
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch {
        toast.error("Vaga não encontrada");
        router.push("/open-positions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleApply(payload?: {
    coverLetter?: string;
    yearsExperience?: number;
    salaryExpected?: number;
    startDate?: string;
    availability?: "IMMEDIATE" | "2_WEEKS" | "1_MONTH" | "NEGOTIABLE";
    questionAnswers?: {
      questionId: string;
      answer: string;
    }[];
  }) {
    try {
      setApplying(true);
      await applyToJob(id, payload ?? {});
      setApplied(true);
      setShowApplicationForm(false);
      toast.success("Candidatura enviada!");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      if (err.response?.status === 409) {
        toast.error("Você já se candidatou a esta vaga");
      } else {
        toast.error(
          err.response?.data?.message ?? "Não foi possível enviar candidatura",
        );
      }
    } finally {
      setApplying(false);
    }
  }

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400 text-sm">Carregando vaga...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                  <p className="text-xs text-zinc-400">
                    {userRole === "COMPANY" ? "Empresa" : "Candidato"}
                  </p>
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

      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Voltar */}
        <button
          onClick={() => router.push("/open-positions")}
          className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-10 flex items-center gap-1"
        >
          ← Voltar para vagas
        </button>

        {/* Header da vaga */}
        <div className="mb-10 border-b border-zinc-100 pb-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 text-lg font-semibold shrink-0">
                {job.company.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">
                  {job.title}
                </h1>
                <p className="text-zinc-400 mt-1">{job.company.name}</p>
                <div className="flex flex-wrap gap-2 mt-4">
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
                  <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                    {job._count.applications} candidatura
                    {job._count.applications !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão candidatar — só para candidatos */}
            {userRole === "CANDIDATE" && (
              <button
                onClick={() => setShowApplicationForm((prev) => !prev)}
                disabled={applying || applied}
                className={`shrink-0 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  applied
                    ? "bg-green-50 text-green-600 cursor-default"
                    : "bg-zinc-900 text-white hover:bg-zinc-700"
                }`}
              >
                {applied
                  ? "Candidatura enviada ✓"
                  : showApplicationForm
                    ? "Fechar formulário"
                    : "Candidatar-se"}
              </button>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">
              Sobre a vaga
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {job.company.description && (
            <div className="border-t border-zinc-100 pt-8">
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">
                Sobre a empresa
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {job.company.description}
              </p>
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                >
                  {job.company.website} →
                </a>
              )}
            </div>
          )}
        </div>

        {userRole === "CANDIDATE" && showApplicationForm && !applied && (
          <div className="mt-12 border border-zinc-200 rounded-2xl p-6 bg-zinc-50">
            <ApplicationForm
              jobTitle={job.title}
              questions={job.questions ?? []}
              onSubmit={handleApply}
              isLoading={applying}
            />
          </div>
        )}

        {/* Botão candidatar inferior */}
        {userRole === "CANDIDATE" && (
          <div className="mt-12 pt-10 border-t border-zinc-100">
            <button
              onClick={() => setShowApplicationForm((prev) => !prev)}
              disabled={applying || applied}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                applied
                  ? "bg-green-50 text-green-600 cursor-default"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              }`}
            >
              {applied
                ? "Candidatura enviada ✓"
                : showApplicationForm
                  ? "Fechar formulário de candidatura"
                  : "Candidatar-se a esta vaga"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
