import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoGdf from "@/images/logo gdf.png";

interface AuthHeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function AuthHeader({ userName, userRole, onLogout }: AuthHeaderProps) {
  return (
    <header className="w-full sticky top-0 z-50" role="banner">
      <div className="bg-institutional-blue px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-28 rounded-md bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden"
              aria-label="Logo do Governo do Distrito Federal"
            >
              <img
                src={logoGdf}
                alt="Logo do Governo do Distrito Federal"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-white text-sm">Sistema ESP / SEEDF</span>
          </div>
          
          {userName && (
            <div className="flex items-center gap-4">
              <div className="text-white text-sm text-right">
                <div className="font-medium">{userName}</div>
                {userRole && <div className="text-xs opacity-90">{userRole}</div>}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                aria-label="Notificações"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onLogout}
                aria-label="Sair do sistema"
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-institutional-yellow h-1" aria-hidden="true" />
    </header>
  );
}
