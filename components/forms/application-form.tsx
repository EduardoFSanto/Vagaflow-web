"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplyPayload } from "@/services/application.service";

const applicationFormSchema = z.object({
  coverLetter: z
    .string()
    .min(50, "Carta de apresentação deve ter no mínimo 50 caracteres"),
  yearsExperience: z.number().min(0, "Experiência não pode ser negativa"),
  relevantProjects: z
    .string()
    .min(20, "Descreva projetos relevantes")
    .optional(),
  achievements: z.string().optional(),
  availability: z.enum(["IMMEDIATE", "2_WEEKS", "1_MONTH", "NEGOTIABLE"]),
  salaryExpected: z.number().positive("Salário esperado deve ser positivo"),
  startDate: z.string().min(1, "Data de início obrigatória"),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  jobTitle: string;
  onSubmit: (data: ApplyPayload) => Promise<void>;
  isLoading?: boolean;
}

export function ApplicationForm({
  jobTitle,
  onSubmit,
  isLoading = false,
}: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
  });

  async function handleFormSubmit(data: ApplicationFormData) {
    await onSubmit({
      coverLetter: data.coverLetter,
      yearsExperience: data.yearsExperience,
      salaryExpected: data.salaryExpected,
      startDate: data.startDate
        ? new Date(data.startDate).toISOString()
        : undefined,
      availability: data.availability,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Candidatar para</h2>
        <p className="text-lg text-zinc-600">{jobTitle}</p>
      </div>

      {/* Carta de Apresentação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sua Candidatura</h3>

        <div className="space-y-1.5">
          <Label htmlFor="coverLetter">Carta de Apresentação *</Label>
          <Textarea
            id="coverLetter"
            placeholder="Conte por que você é um ótimo candidato para esta vaga. Inclua uma breve introdução, sua experiência relevante e por que você está interessado nesta oportunidade..."
            className="resize-none min-h-[150px]"
            {...register("coverLetter")}
          />
          {errors.coverLetter && (
            <p className="text-destructive text-xs">
              {errors.coverLetter.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="relevantProjects">
            Projetos Relevantes (Opcional)
          </Label>
          <Textarea
            id="relevantProjects"
            placeholder="Descreva 2-3 projetos que demonstram suas habilidades relacionadas a esta vaga..."
            className="resize-none"
            {...register("relevantProjects")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="achievements">
            Conquistas Profissionais (Opcional)
          </Label>
          <Textarea
            id="achievements"
            placeholder="Destaque as principais realizações como aumento de performance, liderança, certificados, etc."
            className="resize-none"
            {...register("achievements")}
          />
        </div>
      </div>

      {/* Experiência e Expectativas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Experiência e Expectativas</h3>

        <div className="space-y-1.5">
          <Label htmlFor="yearsExperience">Anos de Experiência *</Label>
          <Input
            id="yearsExperience"
            type="number"
            placeholder="5"
            {...register("yearsExperience", { valueAsNumber: true })}
          />
          {errors.yearsExperience && (
            <p className="text-destructive text-xs">
              {errors.yearsExperience.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="salaryExpected">Salário Esperado (R$) *</Label>
            <Input
              id="salaryExpected"
              type="number"
              placeholder="70000"
              {...register("salaryExpected", { valueAsNumber: true })}
            />
            {errors.salaryExpected && (
              <p className="text-destructive text-xs">
                {errors.salaryExpected.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate">Data de Início *</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-destructive text-xs">
                {errors.startDate.message}
              </p>
            )}
          </div>
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
            <option value="2_WEEKS">Em 2 semanas</option>
            <option value="1_MONTH">Em 1 mês</option>
            <option value="NEGOTIABLE">Negociável</option>
          </select>
          {errors.availability && (
            <p className="text-destructive text-xs">
              {errors.availability.message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Quanto mais detalhada e personalizada sua
          candidatura, maiores são suas chances de sucesso. Dedique tempo a
          escrever uma boa carta de apresentação!
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? "Enviando..." : "Enviar Candidatura"}
      </Button>
    </form>
  );
}
