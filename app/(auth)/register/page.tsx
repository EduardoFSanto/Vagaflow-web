"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/services/auth.service";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

type Role = "CANDIDATE" | "COMPANY";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CANDIDATE");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await registerUser({ ...data, role });
      localStorage.setItem("@vagaflow:token", res.token);
      localStorage.setItem("@vagaflow:role", res.user.role);
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex lg:w-[45%] bg-zinc-950 flex-col justify-between p-14">
        <span className="text-white font-semibold text-lg tracking-tight">
          Vagaflow
        </span>
        <div className="space-y-4">
          <p className="text-white text-4xl font-medium leading-tight max-w-xs">
            Comece sua jornada no mercado de trabalho.
          </p>
          <p className="text-zinc-500 text-sm">
            Crie sua conta em menos de 2 minutos.
          </p>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 Vagaflow</p>
      </div>

      {/* Painel direito */}
      <div className="flex flex-1 items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900">
              Criar conta
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Escolha como quer usar o Vagaflow
            </p>
          </div>

          {/* Seleção de role */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(
              [
                {
                  value: "CANDIDATE",
                  label: "Candidato",
                  icon: User,
                  desc: "Busco vagas",
                },
                {
                  value: "COMPANY",
                  label: "Empresa",
                  icon: Building2,
                  desc: "Publico vagas",
                },
              ] as const
            ).map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all",
                  role === value
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 mb-1",
                    role === value ? "text-zinc-900" : "text-zinc-400",
                  )}
                />
                <span className="text-sm font-medium text-zinc-900">
                  {label}
                </span>
                <span className="text-xs text-zinc-500">{desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                {role === "COMPANY" ? "Nome da empresa" : "Nome completo"}
              </Label>
              <Input
                id="name"
                placeholder={role === "COMPANY" ? "Acme Ltda." : "João Silva"}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-zinc-900 font-medium underline underline-offset-4"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
