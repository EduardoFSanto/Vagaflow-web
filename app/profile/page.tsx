"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getCandidateProfile,
  getCompanyProfile,
  updateCandidateProfile,
  updateCompanyProfile,
  deleteProfile,
} from "@/services/profile.service";

const candidateSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").optional(),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato: (XX) XXXXX-XXXX")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Mínimo 5 caracteres")
    .optional()
    .or(z.literal("")),
  bio: z.string().min(10, "Mínimo 10 caracteres").optional().or(z.literal("")),
  experience: z.number().min(0).optional(),
  resumeUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

const companySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").optional(),
  description: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .optional()
    .or(z.literal("")),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "Formato: XX.XXX.XXX/XXXX-XX")
    .optional()
    .or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato: (XX) XXXXX-XXXX")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Mínimo 5 caracteres")
    .optional()
    .or(z.literal("")),
});

type CandidateForm = z.infer<typeof candidateSchema>;
type CompanyForm = z.infer<typeof companySchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const candidateForm = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
  });

  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

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
          companyForm.reset({
            name: data.name ?? "",
            description: data.description ?? "",
            cnpj: data.cnpj ?? "",
            website: data.website ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
          });
        } else {
          const data = await getCandidateProfile();
          setProfile(data);
          setRole("CANDIDATE");
          candidateForm.reset({
            name: data.name ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            bio: data.bio ?? "",
            experience: data.experience ?? 0,
            resumeUrl: data.resumeUrl ?? "",
          });
        }
      } catch {
        router.push("/login");
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onCandidateSubmit(data: CandidateForm) {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
      );
      await updateCandidateProfile(cleaned);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    }
  }

  async function onCompanySubmit(data: CompanyForm) {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
      );
      await updateCompanyProfile(cleaned);
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      setDeleting(true);
      await deleteProfile(role as "CANDIDATE" | "COMPANY");
      localStorage.removeItem("@vagaflow:token");
      localStorage.removeItem("@vagaflow:role");
      toast.success("Conta deletada");
      router.push("/");
    } catch {
      toast.error("Erro ao deletar conta");
      setDeleting(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400 text-sm">Carregando...</p>
      </div>
    );
  }

  const firstName = String(profile.name).split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

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
          <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center">
            {initial}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Titulo */}
        <div className="mb-12 border-b border-zinc-100 pb-10">
          <p className="text-sm text-zinc-400 uppercase tracking-widest mb-2">
            {role === "COMPANY" ? "Empresa" : "Candidato"}
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">
            {String(profile.name)}
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            {String((profile.user as Record<string, unknown>)?.email ?? "")}
          </p>
        </div>

        {/* Formulário candidato */}
        {role === "CANDIDATE" && (
          <form
            onSubmit={candidateForm.handleSubmit(onCandidateSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input
                  placeholder="Seu nome"
                  {...candidateForm.register("name")}
                />
                {candidateForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  {...candidateForm.register("phone")}
                />
                {candidateForm.formState.errors.phone && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input
                  placeholder="Rua, número, cidade"
                  {...candidateForm.register("address")}
                />
                {candidateForm.formState.errors.address && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Anos de experiência</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...candidateForm.register("experience", {
                    valueAsNumber: true,
                  })}
                />
                {candidateForm.formState.errors.experience && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.experience.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Bio</Label>
                <textarea
                  placeholder="Fale um pouco sobre você..."
                  rows={4}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                  {...candidateForm.register("bio")}
                />
                {candidateForm.formState.errors.bio && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.bio.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>URL do currículo</Label>
                <Input
                  placeholder="https://..."
                  {...candidateForm.register("resumeUrl")}
                />
                {candidateForm.formState.errors.resumeUrl && (
                  <p className="text-xs text-red-500">
                    {candidateForm.formState.errors.resumeUrl.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={candidateForm.formState.isSubmitting}
            >
              {candidateForm.formState.isSubmitting
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </form>
        )}

        {/* Formulário company */}
        {role === "COMPANY" && (
          <form
            onSubmit={companyForm.handleSubmit(onCompanySubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label>Nome da empresa</Label>
                <Input
                  placeholder="Nome da empresa"
                  {...companyForm.register("name")}
                />
                {companyForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  {...companyForm.register("cnpj")}
                />
                {companyForm.formState.errors.cnpj && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.cnpj.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  {...companyForm.register("phone")}
                />
                {companyForm.formState.errors.phone && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  placeholder="https://suaempresa.com"
                  {...companyForm.register("website")}
                />
                {companyForm.formState.errors.website && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.website.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Endereço</Label>
                <Input
                  placeholder="Rua, número, cidade"
                  {...companyForm.register("address")}
                />
                {companyForm.formState.errors.address && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Descrição</Label>
                <textarea
                  placeholder="Descreva sua empresa..."
                  rows={4}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                  {...companyForm.register("description")}
                />
                {companyForm.formState.errors.description && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={companyForm.formState.isSubmitting}
            >
              {companyForm.formState.isSubmitting
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </form>
        )}

        {/* Zona de perigo */}
        <div className="mt-16 border-t border-zinc-100 pt-10">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Zona de perigo
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Ao deletar sua conta, todos os seus dados serão removidos
            permanentemente.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              confirmDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-red-200 text-red-500 hover:bg-red-50"
            }`}
          >
            {deleting
              ? "Deletando..."
              : confirmDelete
                ? "Confirmar exclusão"
                : "Deletar conta"}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="ml-3 text-sm text-zinc-400 hover:text-zinc-900"
            >
              Cancelar
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
