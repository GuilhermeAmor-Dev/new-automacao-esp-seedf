import logoGdf from "@/images/logo gdf.png";
import { Link } from "wouter";

export function PublicHeader() {
  return (
    <header className="w-full" role="banner">
      <div className="bg-institutional-blue py-6">
        <div className="container mx-auto flex justify-center">
          <div className="text-center">
            <Link href="/">
              <div
                className="h-12 w-32 rounded-md bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden hover:bg-white/15 transition-colors"
                aria-label="Ir para a página inicial"
              >
                <img
                  src={logoGdf}
                  alt="Logo do Governo do Distrito Federal"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-institutional-yellow h-1" aria-hidden="true" />
    </header>
  );
}
