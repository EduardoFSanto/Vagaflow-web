"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getCompanyProfile,
  getCandidateProfile,
} from "@/services/profile.service";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("@vagaflow:token");
    const storedRole = localStorage.getItem("@vagaflow:role");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        if (storedRole === "COMPANY") {
          const data = await getCompanyProfile();
          setProfile(data);
          setRole("COMPANY");
        } else {
          const data = await getCandidateProfile();
          setProfile(data);
          setRole("CANDIDATE");
        }
      } catch {
        router.push("/login");
      }
    }

    loadProfile();
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

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400 text-sm">Carregando...</p>
      </div>
    );
  }

  const firstName = String(profile.name).split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const candidateLinks = [
    {
      icon: "○",
      label: "Vagas abertas",
      description: "Explore oportunidades disponíveis no mercado",
      href: "/open-positions",
    },
    {
      icon: "◇",
      label: "Minhas candidaturas",
      description: "Acompanhe o status de cada aplicação",
      href: "/applications",
    },
    {
      icon: "□",
      label: "Meu perfil",
      description: "Mantenha suas informações atualizadas",
      href: "/profile",
    },
  ];

  const companyLinks = [
    {
      icon: "○",
      label: "Minhas vagas",
      description: "Gerencie e publique novas posições",
      href: "/job-offers",
    },
    {
      icon: "◇",
      label: "Candidaturas recebidas",
      description: "Veja e gerencie quem se candidatou às suas vagas",
      href: "/company-applications",
    },
    {
      icon: "□",
      label: "Perfil da empresa",
      description: "Edite as informações da sua empresa",
      href: "/profile",
    },
  ];

  const links = role === "COMPANY" ? companyLinks : candidateLinks;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-100 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-zinc-900 text-xl tracking-tight">
            Vaga<span className="text-blue-600">flow</span>
          </span>

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
                    {String(profile.name)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {role === "COMPANY" ? "Empresa" : "Candidato"}
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-12">
        <div className="mb-12">
          <p className="text-sm text-zinc-400 mb-3 uppercase tracking-widest">
            {role === "COMPANY" ? "Painel da empresa" : "Painel do candidato"}
          </p>
          <h1 className="text-4xl font-bold text-zinc-900 leading-tight">
            Bem-vindo, <span className="text-blue-600">{firstName}</span>.
          </h1>
          <p className="text-zinc-500 mt-3 text-lg">
            {role === "COMPANY"
              ? "Gerencie suas vagas e encontre os melhores talentos do mercado."
              : "Encontre oportunidades que combinam com o seu perfil."}
          </p>
        </div>

        {/* Estatísticas */}
        {role === "CANDIDATE" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Total de Candidaturas
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">12</p>
              <p className="text-xs text-zinc-500 mt-2">+2 este mês</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Aprovações
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">3</p>
              <p className="text-xs text-zinc-500 mt-2">25% de aprovação</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Aguardando Resposta
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">5</p>
              <p className="text-xs text-zinc-500 mt-2">Última há 2 dias</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Perfil Visto Por
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">18</p>
              <p className="text-xs text-zinc-500 mt-2">Este mês</p>
            </div>
          </div>
        )}

        {role === "COMPANY" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Vagas Abertas
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">5</p>
              <p className="text-xs text-zinc-500 mt-2">2 com alta demanda</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Candidatos
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">32</p>
              <p className="text-xs text-zinc-500 mt-2">+8 esta semana</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-500 text-xs uppercase tracking-wide">
                Contratações
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">2</p>
              <p className="text-xs text-zinc-500 mt-2">Este mês</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <p className="text-zinc-600 text-sm font-medium">
                Vagas Visualizadas
              </p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">1.2k</p>
              <p className="text-xs text-zinc-500 mt-2">Este mês</p>
            </div>
          </div>
        )}
      </section>

      {/* Separator */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-zinc-100"></div>
      </div>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="group text-left border border-zinc-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              <span className="text-3xl text-zinc-300 group-hover:text-blue-600 transition-colors">
                {link.icon}
              </span>
              <h3 className="text-zinc-900 font-semibold text-lg mt-4 mb-2 group-hover:text-blue-600">
                {link.label}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {link.description}
              </p>
              <span className="inline-block mt-4 text-sm text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                Acessar →
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
