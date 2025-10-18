import { useState } from "react";
import { useRoute, Link } from "wouter";
import { AuthHeader } from "@/components/AuthHeader";
import { InstitutionalButton } from "@/components/InstitutionalButton";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RefreshCw, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Selo } from "@shared/schema";

const tabs = [
  { id: "identificacao", label: "Identificação" },
  { id: "projetos", label: "Projetos" },
  { id: "descricao", label: "Descrição e Aplicação" },
  { id: "execucao", label: "Execução" },
  { id: "fichas", label: "Fichas de Referência" },
  { id: "recebimento", label: "Recebimento" },
  { id: "servicos", label: "Serviços Incluídos" },
  { id: "criterios", label: "Critérios de Medição" },
  { id: "legislacao", label: "Legislação e Referências" },
  { id: "visualizar-pdf", label: "Visualização de PDF" },
  { id: "exportar-pdf", label: "Exportar PDF" },
];

export default function EspEditor() {
  const [, params] = useRoute("/esp/:id/*?");
  const [activeTab, setActiveTab] = useState("identificacao");
  const [dataPublicacao, setDataPublicacao] = useState<Date>();
  const [visivel, setVisivel] = useState(true);
  
  const [, setLocation] = useLocation();
  const user = JSON.parse(localStorage.getItem("esp_auth_user") || "{}");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("esp_auth_user");
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("esp_auth_user");
      setLocation("/login");
    }
  };

  const handleSave = () => {
    console.log("Save ESP");
  };

  const handleUpdate = () => {
    console.log("Update ESP");
  };

  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader
        userName={user.nome}
        userRole={user.perfil}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex">
        {/* Sidebar with Tabs */}
        <aside className="w-64 bg-card border-r p-4 overflow-y-auto">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          
          <nav className="space-y-1" role="navigation" aria-label="Seções da ESP">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-yellow",
                  activeTab === tab.id
                    ? "bg-institutional-yellow text-black font-medium"
                    : "hover:bg-muted"
                )}
                data-testid={`tab-${tab.id}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "identificacao" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Identificação</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tipologia">Tipologia</Label>
                    <Input
                      id="tipologia"
                      data-testid="input-tipologia"
                      className="mt-1"
                      placeholder="Ex: Edificação"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="id-componente">ID do componente</Label>
                    <Input
                      id="id-componente"
                      data-testid="input-id-componente"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="codigo">Código da listagem</Label>
                    <Input
                      id="codigo"
                      data-testid="input-codigo"
                      className="mt-1"
                      placeholder="ESP-XXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="revisao">Revisão</Label>
                    <Input
                      id="revisao"
                      data-testid="input-revisao"
                      className="mt-1"
                      placeholder="v1.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data-publicacao">Data de Publicação</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="data-publicacao"
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !dataPublicacao && "text-muted-foreground"
                          )}
                          data-testid="button-date-publicacao"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataPublicacao ? format(dataPublicacao, "PPP", { locale: ptBR }) : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dataPublicacao}
                          onSelect={setDataPublicacao}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="autor">Autor</Label>
                    <Input
                      id="autor"
                      data-testid="input-autor"
                      className="mt-1"
                      value={user.nome}
                      disabled
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="selo">Selo</Label>
                    <Select>
                      <SelectTrigger
                        id="selo"
                        className="mt-1"
                        data-testid="select-selo"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Selo.NENHUM}>Nenhum</SelectItem>
                        <SelectItem value={Selo.AMBIENTAL}>Ambiental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      id="visivel"
                      checked={visivel}
                      onCheckedChange={setVisivel}
                      data-testid="switch-visivel"
                    />
                    <Label htmlFor="visivel" className="cursor-pointer">
                      ESP visível
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    data-testid="input-titulo"
                    className="mt-1"
                    placeholder="Título da ESP"
                  />
                </div>
              </div>
            )}

            {activeTab === "projetos" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Projetos</h1>
                <p className="text-muted-foreground">
                  Faça upload de arquivos de projeto (imagens, PDF, DOCX)
                </p>
                <UploadDropzone onFilesSelected={handleFilesSelected} />
              </div>
            )}

            {activeTab === "descricao" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Descrição e Aplicação</h1>
                <div>
                  <Label htmlFor="descricao-aplicacao">Conteúdo</Label>
                  <Textarea
                    id="descricao-aplicacao"
                    data-testid="textarea-descricao"
                    className="mt-1 min-h-[300px]"
                    placeholder="Descreva a aplicação da especificação..."
                  />
                </div>
              </div>
            )}

            {activeTab === "execucao" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Execução</h1>
                <div>
                  <Label htmlFor="execucao">Conteúdo</Label>
                  <Textarea
                    id="execucao"
                    data-testid="textarea-execucao"
                    className="mt-1 min-h-[300px]"
                    placeholder="Descreva os procedimentos de execução..."
                  />
                </div>
              </div>
            )}

            {activeTab === "fichas" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Fichas de Referência</h1>
                <div>
                  <Label htmlFor="fichas-referencia">Conteúdo</Label>
                  <Textarea
                    id="fichas-referencia"
                    data-testid="textarea-fichas"
                    className="mt-1 min-h-[300px]"
                    placeholder="Adicione as fichas de referência..."
                  />
                </div>
              </div>
            )}

            {activeTab === "recebimento" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Recebimento</h1>
                <div>
                  <Label htmlFor="recebimento">Conteúdo</Label>
                  <Textarea
                    id="recebimento"
                    data-testid="textarea-recebimento"
                    className="mt-1 min-h-[300px]"
                    placeholder="Descreva os critérios de recebimento..."
                  />
                </div>
              </div>
            )}

            {activeTab === "servicos" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Serviços Incluídos</h1>
                <div>
                  <Label htmlFor="servicos-incluidos">Conteúdo</Label>
                  <Textarea
                    id="servicos-incluidos"
                    data-testid="textarea-servicos"
                    className="mt-1 min-h-[300px]"
                    placeholder="Liste os serviços incluídos..."
                  />
                </div>
              </div>
            )}

            {activeTab === "criterios" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Critérios de Medição</h1>
                <div>
                  <Label htmlFor="criterios-medicao">Conteúdo</Label>
                  <Textarea
                    id="criterios-medicao"
                    data-testid="textarea-criterios"
                    className="mt-1 min-h-[300px]"
                    placeholder="Descreva os critérios de medição..."
                  />
                </div>
              </div>
            )}

            {activeTab === "legislacao" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Legislação e Referências</h1>
                <div>
                  <Label htmlFor="legislacao">Legislação</Label>
                  <Textarea
                    id="legislacao"
                    data-testid="textarea-legislacao"
                    className="mt-1 min-h-[200px]"
                    placeholder="Legislação aplicável..."
                  />
                </div>
                <div>
                  <Label htmlFor="referencias">Referências</Label>
                  <Textarea
                    id="referencias"
                    data-testid="textarea-referencias"
                    className="mt-1 min-h-[200px]"
                    placeholder="Referências bibliográficas..."
                  />
                </div>
              </div>
            )}

            {activeTab === "visualizar-pdf" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Visualização de PDF</h1>
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Pré-visualização do PDF será exibida aqui</p>
                </div>
              </div>
            )}

            {activeTab === "exportar-pdf" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">Exportar PDF</h1>
                <div className="border rounded-lg p-8 text-center space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Exporte a ESP como arquivo PDF
                  </p>
                  <InstitutionalButton
                    variant="primary"
                    data-testid="button-export-pdf"
                  >
                    Exportar PDF
                  </InstitutionalButton>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed on the right */}
          <div className="border-t p-4 bg-card">
            <div className="max-w-4xl flex justify-end gap-3">
              <InstitutionalButton
                variant="secondary"
                onClick={handleSave}
                className="gap-2"
                data-testid="button-save"
              >
                <Save className="h-4 w-4" />
                Salvar
              </InstitutionalButton>
              
              <InstitutionalButton
                variant="secondary"
                onClick={handleUpdate}
                className="gap-2"
                data-testid="button-update"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </InstitutionalButton>
              
              <InstitutionalButton
                variant="primary"
                className="gap-2"
                data-testid="button-open-pdf"
              >
                <FileText className="h-4 w-4" />
                Abrir PDF
              </InstitutionalButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
