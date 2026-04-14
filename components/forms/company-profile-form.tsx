"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const companyProfileSchema = z.object({
  description: z.string().min(20, "Descrição deve ter no mínimo 20 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone no formato (XX) XXXXX-XXXX"),
  address: z.string().min(5, "Endereço obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado deve ser 2 caracteres"),
  industry: z.string().min(2, "Setor/Indústria obrigatório"),
  companySize: z.enum(["1-50", "51-200", "201-500", "500+"]),
  foundedYear: z
    .number()
    .min(1800)
    .max(new Date().getFullYear() + 10),
  linkedinUrl: z
    .string()
    .url("URL LinkedIn inválida")
    .optional()
    .or(z.literal("")),
});

type CompanyProfileData = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function CompanyProfileForm({
  onSuccess,
  isLoading = false,
}: CompanyProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileData>({
    resolver: zodResolver(companyProfileSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(data: CompanyProfileData) {
    try {
      // TODO: Chamar API para atualizar perfil com os dados acima
      toast.success("Perfil da empresa atualizado com sucesso!");
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados Básicos da Empresa</h3>

        <div className="space-y-1.5">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            {...register("cnpj")}
          />
          {errors.cnpj && (
            <p className="text-destructive text-xs">{errors.cnpj.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição da Empresa *</Label>
          <Textarea
            id="description"
            placeholder="Qualidade as informações sobre o que fazem, missão e valores..."
            className="resize-none"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-destructive text-xs">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="industry">Setor/Indústria *</Label>
            <select
              id="industry"
              {...register("industry")}
              className="w-full rounded-md border border-zinc-200 px-3 py-2"
            >
              <option value="">Selecione...</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Varejo">Varejo</option>
              <option value="Manufatura">Manufatura</option>
              <option value="Consultoria">Consultoria</option>
              <option value="Marketing">Marketing</option>
              <option value="Logística">Logística</option>
              <option value="Outro">Outro</option>
            </select>
            {errors.industry && (
              <p className="text-destructive text-xs">
                {errors.industry.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="companySize">Tamanho da Empresa *</Label>
            <select
              id="companySize"
              {...register("companySize")}
              className="w-full rounded-md border border-zinc-200 px-3 py-2"
            >
              <option value="">Selecione...</option>
              <option value="1-50">1-50 funcionários</option>
              <option value="51-200">51-200 funcionários</option>
              <option value="201-500">201-500 funcionários</option>
              <option value="500+">500+ funcionários</option>
            </select>
            {errors.companySize && (
              <p className="text-destructive text-xs">
                {errors.companySize.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="foundedYear">Ano de Fundação *</Label>
          <Input
            id="foundedYear"
            type="number"
            placeholder="2020"
            {...register("foundedYear", { valueAsNumber: true })}
          />
          {errors.foundedYear && (
            <p className="text-destructive text-xs">
              {errors.foundedYear.message}
            </p>
          )}
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contato</h3>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            placeholder="(11) 98765-4321"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-destructive text-xs">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.seusite.com"
            {...register("website")}
          />
          {errors.website && (
            <p className="text-destructive text-xs">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/company/sua-empresa"
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <p className="text-destructive text-xs">
              {errors.linkedinUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Localização</h3>

        <div className="space-y-1.5">
          <Label htmlFor="address">Endereço *</Label>
          <Input
            id="address"
            placeholder="Rua das Flores, 123"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-destructive text-xs">{errors.address.message}</p>
          )}
        </div>

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
