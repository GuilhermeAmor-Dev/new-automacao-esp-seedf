import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { StatusCaderno } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { validateBody, validateParams } from "../middleware/validate";
import { logger } from "../utils/logger";

const router = Router();

const createCadernoSchema = z.object({
  titulo: z.string().min(3),
  descricao: z.string().optional(),
  status: z.nativeEnum(StatusCaderno).optional(),
  descricaoAplicacao: z.string().optional(),
  execucao: z.string().optional(),
  fichasReferencia: z.string().optional(),
  recebimento: z.string().optional(),
  servicosIncluidos: z.string().optional(),
  criteriosMedicao: z.string().optional(),
  legislacao: z.string().optional(),
  referencias: z.string().optional(),
  introduzirComponente: z.string().optional(),
  constituentesIds: z.array(z.string()).optional(),
  acessoriosIds: z.array(z.string()).optional(),
  acabamentosIds: z.array(z.string()).optional(),
  prototiposIds: z.array(z.string()).optional(),
  aplicacoesIds: z.array(z.string()).optional(),
  constituentesExecucaoIds: z.array(z.string()).optional(),
  fichasReferenciaIds: z.array(z.string()).optional(),
  fichasRecebimentoIds: z.array(z.string()).optional(),
  servicosIncluidosIds: z.array(z.string()).optional(),
});

const updateCadernoSchema = z.object({
  titulo: z.string().min(3).optional(),
  descricao: z.string().optional(),
  status: z.nativeEnum(StatusCaderno).optional(),
  descricaoAplicacao: z.string().optional(),
  execucao: z.string().optional(),
  fichasReferencia: z.string().optional(),
  recebimento: z.string().optional(),
  servicosIncluidos: z.string().optional(),
  criteriosMedicao: z.string().optional(),
  legislacao: z.string().optional(),
  referencias: z.string().optional(),
  introduzirComponente: z.string().optional(),
  constituentesIds: z.array(z.string()).optional(),
  acessoriosIds: z.array(z.string()).optional(),
  acabamentosIds: z.array(z.string()).optional(),
  prototiposIds: z.array(z.string()).optional(),
  aplicacoesIds: z.array(z.string()).optional(),
  constituentesExecucaoIds: z.array(z.string()).optional(),
  fichasReferenciaIds: z.array(z.string()).optional(),
  fichasRecebimentoIds: z.array(z.string()).optional(),
  servicosIncluidosIds: z.array(z.string()).optional(),
});

const paramsSchema = z.object({
  id: z.string(),
});

// GET /api/cadernos
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, autor } = req.query;
    
    const cadernos = await storage.getCadernos({
      status: status as StatusCaderno | undefined,
      autorId: autor as string | undefined,
    });

    // Get authors for each caderno
    const cadernosWithAuthor = await Promise.all(
      cadernos.map(async (caderno) => {
        const autor = await storage.getUserWithoutPassword(caderno.autorId);
        return { ...caderno, autor };
      })
    );

    res.json({ cadernos: cadernosWithAuthor });
  } catch (error) {
    logger.error("Error fetching cadernos", { error });
    res.status(500).json({ error: "Erro ao buscar cadernos" });
  }
});

// GET /api/cadernos/:id
router.get("/:id", authenticateToken, validateParams(paramsSchema), async (req: AuthRequest, res) => {
  try {
    const caderno = await storage.getCaderno(req.params.id);
    if (!caderno) {
      return res.status(404).json({ error: "Caderno não encontrado" });
    }

    const autor = await storage.getUserWithoutPassword(caderno.autorId);
    res.json({ caderno: { ...caderno, autor } });
  } catch (error) {
    logger.error("Error fetching caderno", { error });
    res.status(500).json({ error: "Erro ao buscar caderno" });
  }
});

// POST /api/cadernos
router.post(
  "/",
  authenticateToken,
  requireRole(...Permissions.createCaderno),
  validateBody(createCadernoSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const caderno = await storage.createCaderno({
        ...req.body,
        autorId: req.user.id,
      });

      await storage.createLog({
        userId: req.user.id,
        acao: "CRIAR_CADERNO",
        alvo: caderno.id,
        detalhes: `Caderno "${caderno.titulo}" criado`,
      });

      logger.info("Caderno created", { cadernoId: caderno.id, userId: req.user.id });

      res.status(201).json({ caderno });
    } catch (error) {
      logger.error("Error creating caderno", { error });
      res.status(500).json({ error: "Erro ao criar caderno" });
    }
  }
);

// PATCH /api/cadernos/:id
router.patch(
  "/:id",
  authenticateToken,
  requireRole(...Permissions.editCaderno),
  validateParams(paramsSchema),
  validateBody(updateCadernoSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Se tentar alterar status, valida permissão de mudança de status
      if (req.body.status && !Permissions.changeCadernoStatus.includes(req.user.perfil)) {
        return res.status(403).json({ error: "Acesso negado", message: "Perfil não pode alterar status" });
      }

      const caderno = await storage.updateCaderno(req.params.id, req.body);
      if (!caderno) {
        return res.status(404).json({ error: "Caderno não encontrado" });
      }

      await storage.createLog({
        userId: req.user.id,
        acao: "ATUALIZAR_CADERNO",
        alvo: caderno.id,
        detalhes: `Caderno "${caderno.titulo}" atualizado`,
      });

      logger.info("Caderno updated", { cadernoId: caderno.id, userId: req.user.id });

      res.json({ caderno });
    } catch (error) {
      logger.error("Error updating caderno", { error });
      res.status(500).json({ error: "Erro ao atualizar caderno" });
    }
  }
);

// DELETE /api/cadernos/:id
router.delete(
  "/:id",
  authenticateToken,
  requireRole(...Permissions.deleteCaderno),
  validateParams(paramsSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const caderno = await storage.getCaderno(req.params.id);
      if (!caderno) {
        return res.status(404).json({ error: "Caderno não encontrado" });
      }

      const deleted = await storage.deleteCaderno(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: "Erro ao deletar caderno" });
      }

      await storage.createLog({
        userId: req.user.id,
        acao: "DELETAR_CADERNO",
        alvo: req.params.id,
        detalhes: `Caderno "${caderno.titulo}" deletado`,
      });

      logger.info("Caderno deleted", { cadernoId: req.params.id, userId: req.user.id });

      res.json({ message: "Caderno deletado com sucesso" });
    } catch (error) {
      logger.error("Error deleting caderno", { error });
      res.status(500).json({ error: "Erro ao deletar caderno" });
    }
  }
);

export default router;
