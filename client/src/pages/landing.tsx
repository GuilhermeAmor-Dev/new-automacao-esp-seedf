import { Link } from "wouter";
import logoGdf from "@/images/logo gdf.png";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-institutional-blue flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-x-0 top-0 h-3 bg-institutional-yellow" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-1/2 w-[92%] max-w-6xl -translate-x-1/2 bg-institutional-yellow"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl w-full">
        <div className="bg-institutional-blue text-white rounded-[28px] px-8 py-12 md:px-14 md:py-14 shadow-[0_14px_0_rgba(0,0,0,0.22)] ring-1 ring-white/10 text-center space-y-6">
          <div className="h-16 w-48 mx-auto mb-4 rounded-md bg-white/15 border border-white/25 flex items-center justify-center text-white/80 text-xs tracking-wide overflow-hidden">
            <img
              src={logoGdf}
              alt="Logo do Governo do Distrito Federal"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">SEEDF</h1>
            <p className="text-sm md:text-base font-semibold leading-relaxed">
              SECRETARIA DE ESTADO DE EDUCAÇÃO
              <br className="hidden sm:block" />
              DO DISTRITO FEDERAL
            </p>
          </div>

          <div className="mx-auto h-px w-11/12 bg-white/70" aria-hidden="true" />

          <div className="space-y-1 text-lg md:text-xl font-extrabold leading-snug">
            <p>SISTEMA DE AUTOMAÇÃO</p>
            <p className="text-base md:text-lg">-</p>
            <p>CADERNO DE ESPECIFICAÇÕES</p>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-institutional-blue px-10 py-3 text-white text-lg font-semibold shadow-[0_8px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#1b7bcf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-institutional-yellow"
            data-testid="button-enter"
            aria-label="Entrar no sistema"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="text-sm text-institutional-blue font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-institutional-blue focus-visible:ring-offset-2 rounded px-2 py-1"
            data-testid="link-register"
            aria-label="Criar nova conta"
          >
            Clique aqui para se <span className="font-extrabold">REGISTRAR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
