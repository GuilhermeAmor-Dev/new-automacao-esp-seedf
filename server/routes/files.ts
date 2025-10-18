import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { storage } from "../storage";
import { TipoArquivo } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { logger } from "../utils/logger";

const router = Router();

// Configure multer for memory storage (simulating GridFS for MVP)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

// In-memory file store (simulating GridFS)
const fileStore = new Map<string, { buffer: Buffer; contentType: string }>();

// POST /api/files/upload
router.post(
  "/upload",
  authenticateToken,
  requireRole(...Permissions.createEsp),
  upload.array("files", 10),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const { espId } = req.body;
      if (!espId) {
        return res.status(400).json({ error: "ESP ID é obrigatório" });
      }

      // Verify ESP exists
      const esp = await storage.getEsp(espId);
      if (!esp) {
        return res.status(404).json({ error: "ESP não encontrada" });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Generate file ID (simulating MongoDB ObjectId)
        const fileIdMongo = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store file in memory (simulating GridFS)
        fileStore.set(fileIdMongo, {
          buffer: file.buffer,
          contentType: file.mimetype,
        });

        // Determine file type
        let tipo: TipoArquivo;
        if (file.mimetype.startsWith("image/")) {
          tipo = TipoArquivo.IMAGEM;
        } else if (file.mimetype === "application/pdf") {
          tipo = TipoArquivo.PDF;
        } else {
          tipo = TipoArquivo.DOCX;
        }

        // Save file metadata to storage
        const arquivoMidia = await storage.createArquivoMidia({
          espId,
          tipo,
          filename: file.originalname,
          contentType: file.mimetype,
          fileIdMongo,
        });

        uploadedFiles.push(arquivoMidia);

        await storage.createLog({
          userId: req.user.id,
          acao: "UPLOAD_ARQUIVO",
          alvo: espId,
          detalhes: `Arquivo "${file.originalname}" enviado para ESP`,
        });
      }

      logger.info("Files uploaded", { 
        count: uploadedFiles.length, 
        espId, 
        userId: req.user.id 
      });

      res.status(201).json({ files: uploadedFiles });
    } catch (error) {
      logger.error("Error uploading files", { error });
      res.status(500).json({ error: "Erro ao fazer upload de arquivos" });
    }
  }
);

// GET /api/files/:id/stream
router.get("/:id/stream", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const fileData = fileStore.get(req.params.id);
    if (!fileData) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    res.setHeader("Content-Type", fileData.contentType);
    res.send(fileData.buffer);
  } catch (error) {
    logger.error("Error streaming file", { error });
    res.status(500).json({ error: "Erro ao carregar arquivo" });
  }
});

// GET /api/files/:id/download
router.get("/:id/download", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Find the arquivo metadata
    const arquivos = Array.from(storage["arquivosMidia"].values());
    const arquivo = arquivos.find(a => a.fileIdMongo === req.params.id);
    
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    const fileData = fileStore.get(req.params.id);
    if (!fileData) {
      return res.status(404).json({ error: "Arquivo não encontrado no storage" });
    }

    res.setHeader("Content-Type", fileData.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${arquivo.filename}"`);
    res.send(fileData.buffer);
  } catch (error) {
    logger.error("Error downloading file", { error });
    res.status(500).json({ error: "Erro ao baixar arquivo" });
  }
});

export default router;
