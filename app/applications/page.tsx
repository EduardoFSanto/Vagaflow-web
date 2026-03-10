"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { listMyApplications } from "@/services/application.service";

type Application = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    remote: boolean;
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
    company: {
      id: string;
      name: string;
      logo?: string;
    };
  };
};

const typeLabel = {
  FULL_TIME: "Tempo integral",
  PART_TIME: "Meio período",
  CONTRACT: "Contrato",
};

const statusConfig = {
  PENDING: { label: "Em análise", color: "bg-yellow-50 text-yellow-600" },
  ACCEPTED: { label: "Aprovado", color: "bg-green-50 text-green-600" },
  REJECTED: { label: "Recusado", color: "bg-red-50 text-red-500" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedName = localStorage.getItem("@vagaflow:name");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedName) setUserName(storedName);

    async function load() {
      try {
        const data = await listMyApplications();
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
                  <p className="text-xs text-zinc-400">Candidato</p>
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
            Candidato
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">
            Minhas candidaturas
          </h1>
          <p className="text-zinc-400 mt-2 text-base">
            {applications.length} candidatura
            {applications.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        {/* Lista */}
        {applications.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-sm">
              Você ainda não se candidatou a nenhuma vaga.
            </p>
            <button
              onClick={() => router.push("/open-positions")}
              className="mt-4 text-sm text-zinc-900 font-medium underline underline-offset-4"
            >
              Ver vagas abertas
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {applications.map((app) => (
              <div
                key={app.id}
                className="py-6 flex items-start justify-between gap-6"
              >
                <div className="flex items-start gap-5">
                  {/* Logo ou inicial */}
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 text-sm font-semibold shrink-0 mt-0.5">
                    {app.job.company.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-zinc-900 font-semibold text-base">
                      {app.job.title}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-0.5">
                      {app.job.company.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                        {app.job.location}
                      </span>
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md">
                        {typeLabel[app.job.type]}
                      </span>
                      {app.job.remote && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">
                          Remoto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}
                  >
                    {statusConfig[app.status].label}
                  </span>
                  <p className="text-zinc-400 text-xs">
                    {new Date(app.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
