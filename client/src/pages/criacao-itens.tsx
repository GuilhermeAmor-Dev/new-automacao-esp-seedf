import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, RefreshCw, FileText, Bold, Italic, List } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertItemEspecificacaoSchema, CategoriaItem, SubcategoriaItem } from "@shared/schema";

const itemFormSchema = insertItemEspecificacaoSchema.extend({
  titulo: z.string().min(1, "Título é obrigatório"),
  categoria: z.nativeEnum(CategoriaItem, { required_error: "Categoria é obrigatória" }),
  subcategoria: z.nativeEnum(SubcategoriaItem, { required_error: "Subcategoria é obrigatória" }),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

const subcategoriasPorCategoria: Record<CategoriaItem, SubcategoriaItem[]> = {
  [CategoriaItem.DESCRICAO]: [
    SubcategoriaItem.CONSTITUINTES,
    SubcategoriaItem.ACESSORIOS,
    SubcategoriaItem.ACABAMENTOS,
    SubcategoriaItem.PROTOTIPO_COMERCIAL,
    SubcategoriaItem.TEXTO_GERAL,
    SubcategoriaItem.SEM_SUBCATEGORIA,
  ],
  [CategoriaItem.FICHA_DE_REFERENCIA]: [SubcategoriaItem.CATALOGO_SERVICOS],
  [CategoriaItem.APLICACAO]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.EXECUCAO]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.RECEBIMENTO]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.SERVICOS_INCLUIDOS]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.CRITERIOS_MEDICAO]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.LEGISLACAO]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.NORMAS]: [SubcategoriaItem.SEM_SUBCATEGORIA],
  [CategoriaItem.REFERENCIA]: [SubcategoriaItem.SEM_SUBCATEGORIA],
};

function RichTextEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const getSelectionRange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreRange = (range: Range | null) => {
    if (!range) return;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  useEffect(() => {
    if (editorRef.current && (editorRef.current.innerHTML || "") !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const syncValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const applyCommand = (command: string) => {
    const currentRange = getSelectionRange();
    focusEditor();
    restoreRange(currentRange);
    document.execCommand(command, false);
    syncValue();
  };

  const applyList = () => {
    const currentRange = getSelectionRange();
    focusEditor();
    restoreRange(currentRange);
    document.execCommand("insertUnorderedList", false);
    syncValue();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-2 bg-muted/60 px-2 py-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyCommand("bold")}
          aria-label="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyCommand("italic")}
          aria-label="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyList}
          aria-label="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[180px] p-3 text-sm focus:outline-none"
        contentEditable
        data-placeholder="Digite a descrição do item"
        tabIndex={0}
        onInput={syncValue}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default function CriacaoItens() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subcategorias, setSubcategorias] = useState<SubcategoriaItem[]>(
    subcategoriasPorCategoria[CategoriaItem.DESCRICAO]
  );

  const userDataStr = localStorage.getItem("esp_auth_user");
  const user = userDataStr ? JSON.parse(userDataStr) : null;

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      titulo: "",
      categoria: CategoriaItem.DESCRICAO,
      subcategoria: subcategoriasPorCategoria[CategoriaItem.DESCRICAO][0],
      descricao: "",
    },
  });

  const categoriaAtual = form.watch("categoria");

  useEffect(() => {
    if (categoriaAtual) {
      const novas = subcategoriasPorCategoria[categoriaAtual] || [SubcategoriaItem.SEM_SUBCATEGORIA];
      setSubcategorias(novas);
      form.setValue("subcategoria", novas[0]);
    }
  }, [categoriaAtual, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      return await apiRequest("POST", "/api/itens-especificacao", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Item técnico criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/itens-especificacao"] });
      form.reset({
        titulo: "",
        categoria: CategoriaItem.DESCRICAO,
        subcategoria: subcategoriasPorCategoria[CategoriaItem.DESCRICAO][0],
        descricao: "",
      });
      setSubcategorias(subcategoriasPorCategoria[CategoriaItem.DESCRICAO]);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar item técnico",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    form.handleSubmit((data) => {
      createMutation.mutate(data);
    })();
  };

  const handleRefresh = () => {
    form.reset({
      titulo: "",
      categoria: CategoriaItem.DESCRICAO,
      subcategoria: subcategoriasPorCategoria[CategoriaItem.DESCRICAO][0],
      descricao: "",
    });
    setSubcategorias(subcategoriasPorCategoria[CategoriaItem.DESCRICAO]);
  };

  const handleLogout = () => {
    localStorage.removeItem("esp_auth_user");
    localStorage.removeItem("esp_auth_token");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader
        userName={user?.nome || ""}
        userRole={user?.perfil || ""}
        onLogout={handleLogout}
      />

      <div className="border-b bg-card px-6 py-3">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="gap-2 text-sm"
          data-testid="button-voltar"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">
              Criação de Itens e Especificações Técnicas
            </h1>

            <Form {...form}>
              <form className="space-y-6 max-w-3xl">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Item *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome do item a ser criado"
                          className="h-11"
                          data-testid="input-titulo"
                          aria-label="Campo de texto. Digite o nome do item a ser criado."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="h-11"
                            data-testid="select-categoria"
                            aria-label="Selecione a categoria do item."
                          >
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CategoriaItem).map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={subcategorias.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-11"
                            data-testid="select-subcategoria"
                            aria-label="Selecione a subcategoria."
                          >
                            <SelectValue
                              placeholder={
                                subcategorias.length === 0
                                  ? "Nenhuma subcategoria disponível para esta categoria"
                                  : "Selecione a subcategoria"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategorias.map((subcategoria) => (
                            <SelectItem key={subcategoria} value={subcategoria}>
                              {subcategoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <RichTextEditor value={field.value} onChange={field.onChange} />
                          <Textarea
                            className="hidden"
                            value={field.value}
                            readOnly
                            aria-hidden="true"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <div className="flex w-48 flex-col gap-3 border-l bg-card p-4">
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="bg-institutional-blue text-white hover:bg-[#1b7bcf]"
            data-testid="button-save"
            aria-label="Botão salvar item técnico"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="hover:bg-muted/70"
            data-testid="button-refresh"
            aria-label="Botão limpar formulário"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar
          </Button>

          <Button
            variant="outline"
            className="hover:bg-muted/70"
            data-testid="button-open-pdf"
            aria-label="Botão abrir PDF"
          >
            <FileText className="mr-2 h-4 w-4" />
            Abrir PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
