import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { validateParams } from "../middleware/validate";
import { generateEspPdf } from "../services/pdfService";
import { generateEspDocx } from "../services/docxService";
import { logger } from "../utils/logger";
import { readGridFSFileToBuffer } from "../mongo";
import { TipoArquivo } from "@shared/schema";

const router = Router();

const paramsSchema = z.object({
  espId: z.string(),
});

// POST /api/export/pdf/:espId
router.post(
  "/pdf/:espId",
  authenticateToken,
  requireRole(...Permissions.exportPdf),
  validateParams(paramsSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const esp = await storage.getEsp(req.params.espId);
      if (!esp) {
        return res.status(404).json({ error: "ESP não encontrada" });
      }

      const autor = await storage.getUserWithoutPassword(esp.autorId);
      if (!autor) {
        return res.status(404).json({ error: "Autor não encontrado" });
      }

      // Buscar arquivos de projeto (imagens)
      const files = await storage.getArquivosMidiaByEsp(esp.id);
      const images: { filename: string; buffer: Buffer }[] = [];
      for (const file of files) {
        if (file.tipo !== TipoArquivo.IMAGEM) continue;
        try {
          let buffer: Buffer;
          if (file.fileData.startsWith("mongo:")) {
            const parts = file.fileData.split(":");
            const bucketName = parts.length === 3 ? parts[1] : "esp_files";
            const objectId = parts.length === 3 ? parts[2] : parts[1];
            buffer = await readGridFSFileToBuffer(objectId, bucketName);
          } else {
            buffer = Buffer.from(file.fileData, "base64");
          }
          images.push({ filename: file.filename, buffer });
        } catch (err) {
          logger.error("Error loading image for PDF", { fileId: file.id, err });
        }
      }

      const pdfBuffer = await generateEspPdf(esp, autor, images);

      await storage.createLog({
        userId: req.user.id,
        acao: "EXPORTAR_PDF",
        alvo: esp.id,
        detalhes: `PDF exportado para ESP "${esp.codigo}"`,
      });

      logger.info("PDF exported", { espId: esp.id, userId: req.user.id });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${esp.codigo}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error("Error exporting PDF", { error });
      res.status(500).json({ error: "Erro ao exportar PDF" });
    }
  }
);

// POST /api/export/docx/:espId
router.post(
  "/docx/:espId",
  authenticateToken,
  requireRole(...Permissions.exportDocx),
  validateParams(paramsSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const esp = await storage.getEsp(req.params.espId);
      if (!esp) {
        return res.status(404).json({ error: "ESP não encontrada" });
      }

      const autor = await storage.getUserWithoutPassword(esp.autorId);
      if (!autor) {
        return res.status(404).json({ error: "Autor não encontrado" });
      }

      const docxBuffer = await generateEspDocx(esp, autor);

      await storage.createLog({
        userId: req.user.id,
        acao: "EXPORTAR_DOCX",
        alvo: esp.id,
        detalhes: `DOCX exportado para ESP "${esp.codigo}"`,
      });

      logger.info("DOCX exported", { espId: esp.id, userId: req.user.id });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${esp.codigo}.docx"`);
      res.send(docxBuffer);
    } catch (error) {
      logger.error("Error exporting DOCX", { error });
      res.status(500).json({ error: "Erro ao exportar DOCX" });
    }
  }
);

export default router;
