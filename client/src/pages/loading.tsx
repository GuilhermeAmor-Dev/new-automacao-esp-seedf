import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Loading() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/dashboard");
    }, 1500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-institutional-blue flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-white text-3xl font-bold">
          Entrando
        </h1>
        
        <p className="text-white text-lg opacity-90">
          espere só um pouquinho!
        </p>
        
        <div className="flex justify-center pt-4">
          <Loader2 
            className="h-12 w-12 text-institutional-yellow animate-spin"
            aria-label="Carregando"
          />
        </div>
      </div>
      
      <footer className="absolute bottom-8">
        <div className="text-white text-2xl font-bold" aria-label="Logo GDF">
          GDF
        </div>
      </footer>
    </div>
  );
}
