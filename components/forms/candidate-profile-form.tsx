"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const candidateProfileSchema = z.object({
  title: z.string().min(3, "Título profissional obrigatório"),
  bio: z.string().min(20, "Bio deve ter no mínimo 20 caracteres"),
  experience: z.number().min(0, "Experiência não pode ser negativa"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado deve ser 2 caracteres"),
  skills: z.string().min(5, "Adicione pelo menos uma skill"),
  languages: z.string().optional(),
  education: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  linkedinUrl: z
    .string()
    .url("URL LinkedIn inválida")
    .optional()
    .or(z.literal("")),
  githubUrl: z.string().url("URL GitHub inválida").optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("URL Portfólio inválida")
    .optional()
    .or(z.literal("")),
  availability: z.enum(["IMMEDIATE", "30_DAYS", "60_DAYS", "NEGOTIABLE"]),
  expectedSalary: z.number().positive("Salário deve ser positivo").optional(),
});

type CandidateProfileData = z.infer<typeof candidateProfileSchema>;

interface CandidateProfileFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function CandidateProfileForm({
  onSuccess,
  isLoading = false,
}: CandidateProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateProfileData>({
    resolver: zodResolver(candidateProfileSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(data: CandidateProfileData) {
    try {
      // TODO: Chamar API para atualizar perfil com os dados acima
      toast.success("Perfil atualizado com sucesso!");
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados Profissionais</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título Profissional *</Label>
            <Input
              id="title"
              placeholder="Ex: Senior Frontend Developer"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="experience">Anos de Experiência *</Label>
            <Input
              id="experience"
              type="number"
              placeholder="5"
              {...register("experience", { valueAsNumber: true })}
            />
            {errors.experience && (
              <p className="text-destructive text-xs">
                {errors.experience.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio Profissional *</Label>
          <Textarea
            id="bio"
            placeholder="Descreva sua experiência, habilidades e o que você busca"
            className="resize-none"
            {...register("bio")}
          />
          {errors.bio && (
            <p className="text-destructive text-xs">{errors.bio.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="skills">Skills *</Label>
          <Input
            id="skills"
            placeholder="JavaScript, React, Node.js, TypeScript (separadas por vírgula)"
            {...register("skills")}
          />
          {errors.skills && (
            <p className="text-destructive text-xs">{errors.skills.message}</p>
          )}
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Localização</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade *</Label>
            <Input id="city" placeholder="São Paulo" {...register("city")} />
            {errors.city && (
              <p className="text-destructive text-xs">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              placeholder="SP"
              maxLength={2}
              {...register("state")}
            />
            {errors.state && (
              <p className="text-destructive text-xs">{errors.state.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Educação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Educação (Opcional)</h3>

        <div className="space-y-1.5">
          <Label htmlFor="education">Formação</Label>
          <Input
            id="education"
            placeholder="Bacharelado em Ciência da Computação"
            {...register("education")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="university">Universidade</Label>
            <Input
              id="university"
              placeholder="USP"
              {...register("university")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="graduationYear">Ano de Formatura</Label>
            <Input
              id="graduationYear"
              type="number"
              placeholder="2022"
              {...register("graduationYear", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="languages">Idiomas</Label>
          <Input
            id="languages"
            placeholder="Português, Inglês, Espanhol (separados por vírgula)"
            {...register("languages")}
          />
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Links Profissionais (Opcional)
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/seu-perfil"
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <p className="text-destructive text-xs">
              {errors.linkedinUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            type="url"
            placeholder="https://github.com/seu-usuario"
            {...register("githubUrl")}
          />
          {errors.githubUrl && (
            <p className="text-destructive text-xs">
              {errors.githubUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="portfolioUrl">Portfólio</Label>
          <Input
            id="portfolioUrl"
            type="url"
            placeholder="https://seu-portfolio.com"
            {...register("portfolioUrl")}
          />
          {errors.portfolioUrl && (
            <p className="text-destructive text-xs">
              {errors.portfolioUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disponibilidade</h3>

        <div className="space-y-1.5">
          <Label htmlFor="availability">Quando pode começar? *</Label>
          <select
            id="availability"
            {...register("availability")}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          >
            <option value="">Selecione...</option>
            <option value="IMMEDIATE">Imediatamente</option>
            <option value="30_DAYS">Em 30 dias</option>
            <option value="60_DAYS">Em 60 dias</option>
            <option value="NEGOTIABLE">Negociável</option>
          </select>
          {errors.availability && (
            <p className="text-destructive text-xs">
              {errors.availability.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expectedSalary">Salário Esperado (Opcional)</Label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">R$</span>
            <Input
              id="expectedSalary"
              type="number"
              placeholder="50000"
              {...register("expectedSalary", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? "Salvando..." : "Salvar Perfil"}
      </Button>
    </form>
  );
}
