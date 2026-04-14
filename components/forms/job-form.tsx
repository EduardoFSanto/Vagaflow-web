"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const jobFormSchema = z.object({
  title: z.string().min(3, "Título da vaga obrigatório"),
  description: z.string().min(50, "Descrição deve ter no mínimo 50 caracteres"),
  department: z.string().optional(),
  category: z.string().min(2, "Categoria obrigatória"),

  // Localização e Tipo
  location: z.string().min(2, "Localização obrigatória"),
  remote: z.boolean(),

  // Salário
  salaryMin: z.number().positive("Salário mínimo deve ser positivo").optional(),
  salaryMax: z.number().positive("Salário máximo deve ser positivo").optional(),

  // Tipo de contrato
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]),

  // Experiência
  requiredExperience: z.number().min(0, "Experiência não pode ser negativa"),
  educationLevel: z.enum([
    "ENSINO_MEDIO",
    "GRADUACAO",
    "POS_GRADUACAO",
    "NAO_REQUERIDO",
  ]),

  // Skills e idiomas
  requiredSkills: z.string().min(5, "Adicione pelo menos uma skill"),
  languages: z.string().optional(),

  // Benefícios
  benefits: z.string().optional(),

  // Disponibilidade
  schedule: z.enum(["FULL_TIME_8H", "FLEXIBLE", "REMOTE_FLEXIBLE"]).optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
  initialData?: Partial<JobFormData>;
}

export function JobForm({
  onSuccess,
  isLoading = false,
  initialData,
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: initialData,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(data: JobFormData) {
    try {
      // TODO: Chamar API para criar/atualizar vaga com os dados acima
      toast.success("Vaga salva com sucesso!");
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao salvar vaga");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título da Vaga *</Label>
          <Input
            id="title"
            placeholder="Ex: Senior Full Stack Developer"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              placeholder="Ex: Engenharia"
              {...register("department")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Categoria *</Label>
            <select
              id="category"
              {...register("category")}
              className="w-full rounded-md border border-zinc-200 px-3 py-2"
            >
              <option value="">Selecione...</option>
              <option value="TECH">Tecnologia</option>
              <option value="DESIGN">Design</option>
              <option value="PRODUCT">Produto</option>
              <option value="BUSINESS">Negócios</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALES">Vendas</option>
              <option value="HR">Recursos Humanos</option>
              <option value="OPERATIONS">Operações</option>
            </select>
            {errors.category && (
              <p className="text-destructive text-xs">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição da Vaga *</Label>
          <Textarea
            id="description"
            placeholder="Descreva as responsabilidades, requisitos, e o que torna esta vaga especial..."
            className="resize-none min-h-[120px]"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-destructive text-xs">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Localização</h3>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="remote"
            {...register("remote")}
            className="w-4 h-4"
          />
          <Label htmlFor="remote">Trabalho remoto</Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Localização/Base *</Label>
          <Input
            id="location"
            placeholder="São Paulo, SP (ou principal se remoto)"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-destructive text-xs">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      {/* Contratação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tipo de Contratação</h3>

        <div className="space-y-1.5">
          <Label htmlFor="type">Tipo de Contrato *</Label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          >
            <option value="">Selecione...</option>
            <option value="FULL_TIME">Tempo Integral</option>
            <option value="PART_TIME">Meio período</option>
            <option value="CONTRACT">Contrato</option>
            <option value="TEMPORARY">Temporário</option>
          </select>
          {errors.type && (
            <p className="text-destructive text-xs">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="schedule">Regime de Trabalho</Label>
          <select
            id="schedule"
            {...register("schedule")}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          >
            <option value="">Selecione...</option>
            <option value="FULL_TIME_8H">Jornada Integral (8h)</option>
            <option value="FLEXIBLE">Horário Flexível</option>
            <option value="REMOTE_FLEXIBLE">Remoto com Flexibilidade</option>
          </select>
        </div>
      </div>

      {/* Remuneração */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Remuneração</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="salaryMin">Salário Mínimo (opcional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">R$</span>
              <Input
                id="salaryMin"
                type="number"
                placeholder="50000"
                {...register("salaryMin", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salaryMax">Salário Máximo (opcional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">R$</span>
              <Input
                id="salaryMax"
                type="number"
                placeholder="80000"
                {...register("salaryMax", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requisitos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Requisitos</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="requiredExperience">Anos de Experiência *</Label>
            <Input
              id="requiredExperience"
              type="number"
              placeholder="3"
              {...register("requiredExperience", { valueAsNumber: true })}
            />
            {errors.requiredExperience && (
              <p className="text-destructive text-xs">
                {errors.requiredExperience.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="educationLevel">Nível de Educação *</Label>
            <select
              id="educationLevel"
              {...register("educationLevel")}
              className="w-full rounded-md border border-zinc-200 px-3 py-2"
            >
              <option value="">Selecione...</option>
              <option value="ENSINO_MEDIO">Ensino Médio</option>
              <option value="GRADUACAO">Graduação</option>
              <option value="POS_GRADUACAO">Pós-graduação</option>
              <option value="NAO_REQUERIDO">Não Requerido</option>
            </select>
            {errors.educationLevel && (
              <p className="text-destructive text-xs">
                {errors.educationLevel.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requiredSkills">Skills Necessárias *</Label>
          <Input
            id="requiredSkills"
            placeholder="JavaScript, React, Node.js, TypeScript (separadas por vírgula)"
            {...register("requiredSkills")}
          />
          {errors.requiredSkills && (
            <p className="text-destructive text-xs">
              {errors.requiredSkills.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="languages">Idiomas</Label>
          <Input
            id="languages"
            placeholder="Inglês fluente, Espanhol intermediário (opcional)"
            {...register("languages")}
          />
        </div>
      </div>

      {/* Benefícios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Benefícios</h3>

        <div className="space-y-1.5">
          <Label htmlFor="benefits">Benefícios Oferecidos</Label>
          <Textarea
            id="benefits"
            placeholder="VR, VA, Plano de Saúde, Flexibilidade de Horário, etc."
            className="resize-none"
            {...register("benefits")}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? "Salvando..." : "Publicar Vaga"}
      </Button>
    </form>
  );
}
