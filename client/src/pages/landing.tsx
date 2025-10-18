import { Link } from "wouter";
import { InstitutionalButton } from "@/components/InstitutionalButton";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Blue Block */}
      <div className="hidden md:block md:flex-1 bg-institutional-blue" aria-hidden="true" />
      
      {/* Center Yellow Block with Blue Panel */}
      <div className="flex-1 bg-institutional-yellow flex items-center justify-center p-4">
        <div className="bg-institutional-blue rounded-lg p-12 max-w-md w-full text-center shadow-2xl">
          {/* Logo GDF */}
          <div className="mb-6">
            <div className="text-white text-5xl font-bold mb-2" aria-label="Logo do Governo do Distrito Federal">
              GDF
            </div>
          </div>
          
          {/* SEEDF Title */}
          <h1 className="text-white text-3xl font-bold mb-3">
            SEEDF
          </h1>
          
          {/* Subtitle */}
          <p className="text-white text-lg mb-8 opacity-95">
            Sistema de Automação do Caderno de Especificações
          </p>
          
          {/* Yellow Bottom Strip */}
          <div className="bg-institutional-yellow rounded-md p-6 space-y-4">
            <Link href="/login">
              <InstitutionalButton
                variant="primary"
                className="w-full"
                data-testid="button-enter"
                aria-label="Entrar no sistema"
              >
                Entrar
              </InstitutionalButton>
            </Link>
            
            <div className="text-center">
              <Link
                href="/register"
                className="text-institutional-blue hover:underline font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-blue focus-visible:ring-offset-2 rounded px-2 py-1"
                data-testid="link-register"
                aria-label="Criar nova conta"
              >
                REGISTRAR
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Blue Block */}
      <div className="hidden md:block md:flex-1 bg-institutional-blue" aria-hidden="true" />
    </div>
  );
}
