"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listCompanyApplications,
  updateApplicationStatus,
} from "@/services/application.service";

type Application = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    bio?: string;
    skills: string[];
    experience?: string;
    resumeUrl?: string;
    user: {
      email: string;
    };
  };
  job: {
    id: string;
    title: string;
  };
};

const statusConfig = {
  PENDING: { label: "Em análise", color: "bg-yellow-50 text-yellow-600" },
  ACCEPTED: { label: "Aprovado", color: "bg-green-50 text-green-600" },
  REJECTED: { label: "Recusado", color: "bg-red-50 text-red-500" },
};

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedName = localStorage.getItem("@vagaflow:name");
    const storedRole = localStorage.getItem("@vagaflow:role");

    if (!token || storedRole !== "COMPANY") {
      router.push("/dashboard");
      return;
    }

    if (storedName) setUserName(storedName);

    async function load() {
      try {
        const data = await listCompanyApplications();
        setApplications(data);
      } finally {
        setLoading(false);
      }
    }

    load();
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

  async function handleStatus(id: string, status: "ACCEPTED" | "REJECTED") {
    try {
      await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app)),
      );
      toast.success(
        status === "ACCEPTED" ? "Candidato aprovado!" : "Candidato recusado!",
      );
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400 text-sm">Carregando candidaturas...</p>
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
        <div className="mb-12 border-b border-zinc-100 pb-10">
          <p className="text-sm text-zinc-400 uppercase tracking-widest mb-2">
            Empresa
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">Candidaturas</h1>
          <p className="text-zinc-400 mt-2 text-base">
            {applications.length} candidatura
            {applications.length !== 1 ? "s" : ""} recebida
            {applications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Lista */}
        {applications.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-sm">
              Nenhuma candidatura recebida ainda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {applications.map((app) => (
              <div key={app.id} className="py-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 text-sm font-semibold shrink-0">
                      {app.candidate.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="text-zinc-900 font-semibold text-base">
                        {app.candidate.name}
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        {app.candidate.user.email}
                      </p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        Vaga:{" "}
                        <span className="text-zinc-600 font-medium">
                          {app.job.title}
                        </span>
                      </p>

                      {/* Skills */}
                      {app.candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.candidate.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}
                    >
                      {statusConfig[app.status].label}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === app.id ? null : app.id)
                        }
                        className="px-3 py-1.5 border border-zinc-200 text-zinc-600 text-xs rounded-lg hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                      >
                        {expandedId === app.id ? "Fechar" : "Ver detalhes"}
                      </button>
                      {app.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatus(app.id, "ACCEPTED")}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleStatus(app.id, "REJECTED")}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Recusar
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-zinc-400 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expandedId === app.id && (
                  <div className="mt-4 ml-14 p-4 bg-zinc-50 rounded-xl space-y-3">
                    {app.candidate.bio && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-1">
                          Bio
                        </p>
                        <p className="text-sm text-zinc-700">
                          {app.candidate.bio}
                        </p>
                      </div>
                    )}
                    {app.candidate.experience && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-1">
                          Experiência
                        </p>
                        <p className="text-sm text-zinc-700">
                          {app.candidate.experience}
                        </p>
                      </div>
                    )}
                    {app.candidate.resumeUrl && (
                      <a
                        href={app.candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-blue-600 hover:underline"
                      >
                        Ver currículo →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
