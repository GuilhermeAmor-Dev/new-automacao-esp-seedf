import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/logs
router.get(
  "/",
  authenticateToken,
  requireRole(...Permissions.viewLogs),
  async (req: AuthRequest, res) => {
    try {
      const { userId } = req.query;

      const logs = await storage.getLogs(userId as string | undefined);

      // Get user info for each log
      const logsWithUser = await Promise.all(
        logs.map(async (log) => {
          const user = await storage.getUserWithoutPassword(log.userId);
          return { ...log, user };
        })
      );

      res.json({ logs: logsWithUser });
    } catch (error) {
      logger.error("Error fetching logs", { error });
      res.status(500).json({ error: "Erro ao buscar logs" });
    }
  }
);

export default router;
