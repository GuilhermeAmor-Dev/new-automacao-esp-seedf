import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { Perfil } from "@shared/schema";

export function requireRole(...allowedRoles: Perfil[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const userRole = req.user.perfil as Perfil;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Acesso negado",
        message: `Requer perfil: ${allowedRoles.join(" ou ")}` 
      });
    }

    next();
  };
}

// Permissões específicas por ação
export const Permissions = {
  // ESP permissions
  createEsp: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  editEsp: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  deleteEsp: [Perfil.GERENTE, Perfil.DIRETOR],
  changeEspStatus: [Perfil.GERENTE, Perfil.DIRETOR],
  approveEsp: [Perfil.DIRETOR],
  viewEsp: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  
  // Caderno permissions
  createCaderno: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  editCaderno: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  deleteCaderno: [Perfil.GERENTE, Perfil.DIRETOR],
  changeCadernoStatus: [Perfil.GERENTE, Perfil.DIRETOR],
  
  // Export permissions
  exportPdf: [Perfil.ARQUITETO, Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
  exportDocx: [Perfil.DIRETOR],
  
  // Logs permissions
  viewLogs: [Perfil.CHEFE_DE_NUCLEO, Perfil.GERENTE, Perfil.DIRETOR],
};
