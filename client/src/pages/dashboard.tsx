import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthHeader } from "@/components/AuthHeader";
import { InstitutionalButton } from "@/components/InstitutionalButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileText, Plus, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>("");
  const [date, setDate] = useState<Date>();
  
  const [, setLocation] = useLocation();
  const user = JSON.parse(localStorage.getItem("esp_auth_user") || "{}");

  // Fetch cadernos from API
  const { data: cadernosData, isLoading: isLoadingCadernos } = useQuery({
    queryKey: ["/api", "cadernos"],
    queryFn: async () => {
      const response = await fetch("/api/cadernos", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch cadernos");
      return response.json();
    },
    enabled: !!user.id,
  });

  const cadernos = cadernosData?.cadernos || [];

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader
        userName={user.nome}
        userRole={user.perfil}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            data-testid="button-history"
          >
            <History className="h-4 w-4" />
            Visualizar Histórico
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            data-testid="button-create-items"
          >
            <Plus className="h-4 w-4" />
            Criação de Itens
          </Button>
          
          <Link href="/caderno/novo">
            <Button
              variant="default"
              className="gap-2 bg-institutional-blue hover:bg-institutional-blue/90"
              data-testid="button-new-caderno"
            >
              <FileText className="h-4 w-4" />
              Novo Caderno
            </Button>
          </Link>
          
          <Link href="/esp/novo">
            <Button
              variant="default"
              className="gap-2 bg-institutional-blue hover:bg-institutional-blue/90"
              data-testid="button-new-esp"
            >
              <Plus className="h-4 w-4" />
              Nova ESP
            </Button>
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Filtros de Busca</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm">
                Buscar por nome/código
              </Label>
              <Input
                id="search"
                type="search"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="date-filter" className="text-sm">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className={cn(
                      "w-full mt-1 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    data-testid="button-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="author-filter" className="text-sm">
                Autor
              </Label>
              <Input
                id="author-filter"
                type="text"
                placeholder="Nome do autor"
                data-testid="input-author"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter" className="text-sm">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  id="status-filter"
                  className="mt-1"
                  data-testid="select-status"
                >
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="OBSOLETO">Obsoleto</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                  <SelectItem value="APROVADO">Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <InstitutionalButton
              variant="primary"
              data-testid="button-apply-filters"
            >
              Aplicar Filtros
            </InstitutionalButton>
          </div>
        </div>

        {/* Results Section */}
        {isLoadingCadernos ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Carregando cadernos...</p>
          </div>
        ) : cadernos.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold" data-testid="text-empty-state">
                Nenhum CADERNO encontrado
              </h3>
              <p className="text-muted-foreground">
                Comece criando seu primeiro caderno de especificações
              </p>
              <Link href="/caderno/novo">
                <InstitutionalButton
                  variant="primary"
                  className="gap-2"
                  data-testid="button-create-first-caderno"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeiro CADERNO
                </InstitutionalButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{cadernos.length} Caderno(s) Encontrado(s)</h3>
            <div className="space-y-3">
              {cadernos.map((caderno: any) => (
                <div key={caderno.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{caderno.titulo}</h4>
                      {caderno.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{caderno.descricao}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Autor: {caderno.autor?.nome} | Status: {caderno.status}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
