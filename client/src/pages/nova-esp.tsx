import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, RefreshCw, FileText, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Form schema for Nova ESP
const novaEspFormSchema = z.object({
  cadernosIds: z.array(z.string()).min(1, "Selecione pelo menos um caderno"),
});

type NovaEspFormData = z.infer<typeof novaEspFormSchema>;

export default function NovaEsp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user data
  const userDataStr = localStorage.getItem("esp_auth_user");
  const user = userDataStr ? JSON.parse(userDataStr) : null;

  // Fetch available cadernos
  const { data: cadernosData, isLoading: isLoadingCadernos } = useQuery({
    queryKey: ["/api/cadernos"],
    enabled: !!user,
  });

  const form = useForm<NovaEspFormData>({
    resolver: zodResolver(novaEspFormSchema),
    defaultValues: {
      cadernosIds: [],
    },
  });

  const [search, setSearch] = useState("");
  const [selectedCadernos, setSelectedCadernos] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>("");

  // Keep form value in sync
  useEffect(() => {
    form.setValue("cadernosIds", selectedCadernos, { shouldValidate: true });
  }, [selectedCadernos, form]);

  const createMutation = useMutation({
    mutationFn: async (data: NovaEspFormData) => {
      const response = await apiRequest("POST", "/api/esp/nova", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sucesso",
        description: "Nova ESP criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/esp"] });
      
      // Navigate to the new ESP editor
      if (data?.esp?.id) {
        setLocation(`/esp/${data.esp.id}`);
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar ESP",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NovaEspFormData) => {
    createMutation.mutate(data);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cadernos"] });
    setSelectedCadernos([]);
    setCurrentSelection("");
    setSearch("");
    form.reset({
      cadernosIds: [],
    });
    toast({
      title: "Atualizado",
      description: "Formulário limpo e dados recarregados",
    });
  };

  const handleOpenPDF = () => {
    toast({
      title: "Informação",
      description: "Salve a ESP primeiro para gerar o PDF",
    });
  };

  const filteredCadernos = useMemo(() => {
    const list = (cadernosData as any)?.cadernos || [];
    if (!search) return list;
    return list.filter((c: any) => (c.titulo || "").toLowerCase().includes(search.toLowerCase()));
  }, [cadernosData, search]);

  const addCaderno = () => {
    if (!currentSelection) return;
    if (selectedCadernos.includes(currentSelection)) {
      toast({ title: "Já adicionado", description: "Este caderno já está na lista" });
      return;
    }
    setSelectedCadernos((prev) => [...prev, currentSelection]);
  };

  const removeCaderno = (id: string) => {
    setSelectedCadernos((prev) => prev.filter((cid) => cid !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthHeader />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
              aria-label="Voltar ao painel de controle"
              className="hover-elevate"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-black">Nova ESP</h1>
          </div>

          {/* Layout: Form area + Action buttons */}
          <div className="flex gap-6">
            {/* Main form area with scroll */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6 max-h-[calc(100vh-200px)] overflow-auto">
              {/* Visual identifier - ESP box */}
              <div className="mb-6">
                <div 
                  className="inline-block px-6 py-2 rounded text-white font-bold text-lg"
                  style={{ backgroundColor: "#0361ad" }}
                >
                  ESP
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="cadernosIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base font-semibold text-black">
                            Cadernos
                          </FormLabel>
                          <p className="text-sm text-muted-foreground mt-1">
                            Selecione os cadernos que serão compilados na ESP (a ordem segue a lista abaixo).
                          </p>
                        </div>
                        
                        {isLoadingCadernos ? (
                          <div className="text-sm text-muted-foreground">
                            Carregando cadernos disponíveis...
                          </div>
                        ) : (cadernosData as any)?.cadernos && (cadernosData as any).cadernos.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Input
                                placeholder="Buscar caderno..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1"
                              />
                              <div className="flex-1">
                                <Select
                                  value={currentSelection}
                                  onValueChange={(v) => setCurrentSelection(v)}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um caderno" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredCadernos.map((caderno: any) => (
                                      <SelectItem key={caderno.id} value={caderno.id}>
                                        {caderno.titulo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="button" onClick={addCaderno} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {selectedCadernos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhum caderno selecionado.</p>
                              ) : (
                                selectedCadernos.map((id, idx) => {
                                  const caderno = (cadernosData as any)?.cadernos?.find((c: any) => c.id === id);
                                  return (
                                    <div
                                      key={id}
                                      className="flex items-center justify-between border rounded-md p-3 bg-muted/40"
                                    >
                                      <div>
                                        <p className="font-medium text-sm">
                                          {idx + 1}. {caderno?.titulo || id}
                                        </p>
                                        {caderno?.descricao && (
                                          <p className="text-xs text-muted-foreground">{caderno.descricao}</p>
                                        )}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeCaderno(id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground border rounded-md p-4">
                            Nenhum caderno disponível
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            {/* Action buttons - vertical on the right */}
            <div className="flex flex-col gap-3 w-48">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
                data-testid="button-save"
                className="gap-2 bg-institutional-blue text-white hover:bg-[#1b7bcf] w-full justify-start"
                aria-label="Salvar nova ESP com os cadernos selecionados"
              >
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button
                onClick={handleRefresh}
                data-testid="button-refresh"
                variant="outline"
                className="gap-2 w-full justify-start"
                aria-label="Limpar o formulário e recarregar os dados"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                onClick={handleOpenPDF}
                disabled
                data-testid="button-open-pdf"
                className="gap-2 bg-institutional-blue text-white hover:bg-[#1b7bcf] w-full justify-start"
                aria-label="Abrir PDF (disponível após salvar a ESP)"
              >
                <FileText className="h-4 w-4" />
                Abrir PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
