import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { PublicHeader } from "@/components/PublicHeader";
import { InstitutionalButton } from "@/components/InstitutionalButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Perfil } from "@shared/schema";

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").regex(/@.*\.gov\.br$/, "Use e-mail institucional (@*.gov.br)"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  perfil: z.nativeEnum(Perfil, { required_error: "Selecione um cargo" }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          perfil: data.perfil,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode fazer login agora.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-institutional-blue flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-institutional-blue mb-6 text-center">
            Registro
          </h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome completo
              </Label>
              <Input
                id="nome"
                type="text"
                {...register("nome")}
                data-testid="input-name"
                aria-required="true"
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? "nome-error" : undefined}
                className="mt-1 focus-visible:ring-institutional-yellow"
              />
              {errors.nome && (
                <p id="nome-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail institucional
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="usuario@seedf.df.gov.br"
                data-testid="input-email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="mt-1 focus-visible:ring-institutional-yellow"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="senha" className="text-sm font-medium">
                Senha
              </Label>
              <PasswordInput
                id="senha"
                {...register("senha")}
                data-testid="input-password"
                aria-required="true"
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? "senha-error" : undefined}
                className="mt-1 focus-visible:ring-institutional-yellow"
              />
              {errors.senha && (
                <p id="senha-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.senha.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="perfil" className="text-sm font-medium">
                Cargo
              </Label>
              <Select onValueChange={(value) => setValue("perfil", value as Perfil)}>
                <SelectTrigger
                  id="perfil"
                  className="mt-1 focus:ring-institutional-yellow"
                  data-testid="select-role"
                  aria-required="true"
                  aria-invalid={!!errors.perfil}
                  aria-describedby={errors.perfil ? "perfil-error" : undefined}
                >
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Perfil.ARQUITETO}>Arquiteto</SelectItem>
                  <SelectItem value={Perfil.CHEFE_DE_NUCLEO}>Chefe de Núcleo</SelectItem>
                  <SelectItem value={Perfil.GERENTE}>Gerente</SelectItem>
                  <SelectItem value={Perfil.DIRETOR}>Diretor</SelectItem>
                </SelectContent>
              </Select>
              {errors.perfil && (
                <p id="perfil-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.perfil.message}
                </p>
              )}
            </div>

            <InstitutionalButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              data-testid="button-create-account"
            >
              Criar Conta
            </InstitutionalButton>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-institutional-blue hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-blue focus-visible:ring-offset-2 rounded px-2 py-1"
              data-testid="link-login"
            >
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
