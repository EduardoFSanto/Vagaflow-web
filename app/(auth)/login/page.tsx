"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/services/auth.service";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await loginUser(data);
      localStorage.setItem("@vagaflow:token", res.token);
      localStorage.setItem("@vagaflow:role", res.user.role);
      router.push("/dashboard");
    } catch {
      toast.error("Email ou senha incorretos");
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
            Conectando talentos às melhores oportunidades.
          </p>
          <p className="text-zinc-500 text-sm">
            Milhares de vagas esperando por você.
          </p>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 Vagaflow</p>
      </div>

      {/* Painel direito */}
      <div className="flex flex-1 items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-900">Entrar</h1>
            <p className="text-zinc-500 text-sm mt-1">Bem-vindo de volta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="••••••••"
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
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="text-zinc-900 font-medium underline underline-offset-4"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
