"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { listJobs } from "@/services/job.service";

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
  };
};

const typeLabel = {
  FULL_TIME: "Tempo integral",
  PART_TIME: "Meio período",
  CONTRACT: "Contrato",
};

export default function OpenPositionsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "FULL_TIME" | "PART_TIME" | "CONTRACT"
  >("ALL");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedRole = localStorage.getItem("@vagaflow:role");
    const storedName = localStorage.getItem("@vagaflow:name");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedRole) setUserRole(storedRole);
    if (storedName) setUserName(storedName);

    async function load() {
      try {
        const data = await listJobs();
        setJobs(data);
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

  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.name.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || job.type === filter;
    return matchSearch && matchFilter;
  });

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

          {/* Avatar menu */}
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

      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero */}
        <div className="mb-12 border-b border-zinc-100 pb-10">
          <p className="text-sm text-zinc-400 uppercase tracking-widest mb-2">
            Oportunidades
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">Vagas abertas</h1>
          <p className="text-zinc-400 mt-2 text-base">
            {jobs.length} vagas disponíveis no momento
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="Buscar por cargo, empresa ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <div className="flex gap-2">
            {(["ALL", "FULL_TIME", "PART_TIME", "CONTRACT"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
                  }`}
                >
                  {type === "ALL" ? "Todos" : typeLabel[type]}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-sm">Nenhuma vaga encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/open-positions/${job.id}`)}
                className="w-full text-left py-6 group flex items-start justify-between gap-6 hover:bg-zinc-50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 text-sm font-semibold shrink-0 mt-0.5">
                    {job.company.logo ? (
                      <Image
                        src={job.company.logo}
                        alt={job.company.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      job.company.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <h2 className="text-zinc-900 font-semibold text-base group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-0.5">
                      {job.company.name}
                    </p>
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
                </div>

                <span className="text-zinc-300 group-hover:text-zinc-900 transition-colors mt-1 shrink-0">
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
