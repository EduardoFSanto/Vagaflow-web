import Link from "next/link";
import { ArrowRight, Briefcase, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
        <div className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
          <span className="font-bold text-zinc-900 text-xl tracking-tight">
            Vaga<span className="text-blue-600">flow</span>
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-32 text-center">
        <span className="inline-block text-xs font-medium bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full mb-6">
          Plataforma de vagas
        </span>
        <h1 className="text-5xl sm:text-6xl font-semibold text-zinc-900 leading-tight tracking-tight max-w-2xl mx-auto">
          Conectando talentos às melhores oportunidades
        </h1>
        <p className="mt-6 text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
          Candidate-se a vagas que combinam com você ou publique posições para
          encontrar os melhores profissionais do mercado.
        </p>
        <div className="flex items-center justify-center gap-3 mt-10">
          <Button size="lg" asChild>
            <Link href="/register">
              Começar agora <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/open-positions">Ver vagas</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-center text-2xl font-semibold text-zinc-900 mb-16">
            Tudo que você precisa em um só lugar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Vagas em destaque",
                desc: "Acesse centenas de oportunidades em diversas áreas e encontre a que combina com o seu perfil.",
              },
              {
                icon: Users,
                title: "Para empresas",
                desc: "Publique vagas, gerencie candidaturas e encontre os profissionais certos para o seu time.",
              },
              {
                icon: Zap,
                title: "Processo simples",
                desc: "Cadastro em minutos. Candidate-se com um clique e acompanhe o status das suas aplicações.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-zinc-200 p-6"
              >
                <div className="size-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                  <Icon className="size-5 text-zinc-700" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-950 py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-zinc-400 mb-8">
            Crie sua conta gratuitamente e dê o próximo passo na sua carreira.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6 text-center text-xs text-zinc-400">
        © 2026 Vagaflow. Todos os direitos reservados.
      </footer>
    </div>
  );
}
