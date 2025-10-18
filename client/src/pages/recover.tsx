import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { PublicHeader } from "@/components/PublicHeader";
import { InstitutionalButton } from "@/components/InstitutionalButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const recoverSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type RecoverForm = z.infer<typeof recoverSchema>;

export default function Recover() {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async (data: RecoverForm) => {
    try {
      // TODO: Implement password recovery API call
      console.log("Recover data:", data);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-institutional-blue flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-institutional-blue mb-3 text-center">
            Recuperação de Senha
          </h1>
          
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Insira seu e-mail institucional para receber instruções de recuperação
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <InstitutionalButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              data-testid="button-send"
            >
              Enviar
            </InstitutionalButton>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-institutional-blue hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-blue focus-visible:ring-offset-2 rounded px-2 py-1"
              data-testid="link-login"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
