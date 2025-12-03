import { Router } from "express";
import multer from "multer";
import { storage } from "../storage";
import { TipoArquivo } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { logger } from "../utils/logger";
import { uploadBufferToGridFS, getGridFSBucket, ObjectId, readGridFSFileToBuffer } from "../mongo";

const router = Router();

// Configure multer for memory storage
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

// POST /api/files/upload
router.post(
  "/upload",
  authenticateToken,
  requireRole(...Permissions.createEsp),
  upload.array("files", 10),
  async (req: AuthRequest, res) => {
    try {
      logger.info("Upload request received", {
        body: req.body,
        filesCount: req.files ? (req.files as Express.Multer.File[]).length : 0,
        user: req.user?.id
      });

      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        logger.error("No files uploaded");
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const { espId, cadernoId } = req.body;
      if (!espId && !cadernoId) {
        logger.error("Owner missing from request body", { body: req.body });
        return res.status(400).json({ error: "Informe espId ou cadernoId" });
      }

      if (espId) {
        const esp = await storage.getEsp(espId);
        if (!esp) {
          return res.status(404).json({ error: "ESP não encontrada" });
        }
      }

      if (!espId && cadernoId) {
        const caderno = await storage.getCaderno(cadernoId);
        if (!caderno) {
          return res.status(404).json({ error: "Caderno não encontrado" });
        }
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Determine file type
        let tipo: TipoArquivo;
        if (file.mimetype.startsWith("image/")) {
          tipo = TipoArquivo.IMAGEM;
        } else if (file.mimetype === "application/pdf") {
          tipo = TipoArquivo.PDF;
        } else {
          tipo = TipoArquivo.DOCX;
        }

        let fileData: string;
        let bucket = "esp_files";

        if (file.mimetype.startsWith("image/")) {
          bucket = "esp_images";
        } else if (file.mimetype === "application/pdf" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          bucket = "esp_docs";
        }

        // Save to GridFS with bucket and keep pointer
        const mongoId = await uploadBufferToGridFS(file.originalname, file.mimetype, file.buffer, bucket);
        fileData = `mongo:${bucket}:${mongoId.toString()}`;

        // Save file to database
        const arquivoMidia = await storage.createArquivoMidia({
          espId: espId || null,
          cadernoId: espId ? null : cadernoId,
          tipo,
          filename: file.originalname,
          contentType: file.mimetype,
          fileSize: file.size,
          fileData,
        });

        // Don't return fileData in response (too large)
        const { fileData: _, ...fileResponse } = arquivoMidia;
        uploadedFiles.push(fileResponse);

        await storage.createLog({
          userId: req.user.id,
          acao: "UPLOAD_ARQUIVO",
          alvo: espId || cadernoId,
          detalhes: `Arquivo "${file.originalname}" enviado para ${espId ? "ESP" : "Caderno"}`,
        });
      }

      logger.info("Files uploaded", { 
        count: uploadedFiles.length, 
        espId, 
        cadernoId,
        userId: req.user.id 
      });

      res.status(201).json({ files: uploadedFiles });
    } catch (error: any) {
      logger.error("Error uploading files", { 
        error: error.message,
        stack: error.stack,
        details: error 
      });
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message || "Erro ao fazer upload de arquivos"
      });
    }
  }
);

// Multer error handler
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    logger.error("Multer error", { error: error.message, code: error.code });
    return res.status(400).json({ error: error.message });
  } else if (error) {
    logger.error("File upload error", { error: error.message, stack: error.stack });
    return res.status(500).json({ error: error.message || "Erro ao processar upload" });
  }
  next();
});

// GET /api/esp/:espId/files - List files for an ESP or Caderno (owner)
router.get("/:espId/files", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const files = await storage.getArquivosMidiaByOwner(req.params.espId);
    
    // Don't return fileData in list (too large)
    const filesResponse = files.map(({ fileData, ...file }) => file);
    
    res.json({ files: filesResponse });
  } catch (error) {
    logger.error("Error listing files", { error });
    res.status(500).json({ error: "Erro ao listar arquivos" });
  }
});

// GET /api/files/:id/download - Download a file
router.get("/:id/download", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const arquivo = await storage.getArquivoMidiaById(req.params.id);
    
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    if (arquivo.fileData.startsWith("mongo:")) {
      const parts = arquivo.fileData.split(":");
      const bucketName = parts.length === 3 ? parts[1] : "esp_files";
      const objectId = parts.length === 3 ? parts[2] : parts[1];

      res.setHeader("Content-Type", arquivo.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${arquivo.filename}"`);
      const bucket = await getGridFSBucket(bucketName);
      const downloadStream = bucket.openDownloadStream(new ObjectId(objectId));
      downloadStream.on("error", () => res.status(404).json({ error: "Arquivo não encontrado" }));
      downloadStream.pipe(res);
    } else {
      // Convert base64 back to buffer
      const fileBuffer = Buffer.from(arquivo.fileData, "base64");

      res.setHeader("Content-Type", arquivo.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${arquivo.filename}"`);
      res.setHeader("Content-Length", fileBuffer.length);
      res.send(fileBuffer);
    }
  } catch (error) {
    logger.error("Error downloading file", { error });
    res.status(500).json({ error: "Erro ao baixar arquivo" });
  }
});

// GET /api/files/:id/stream - Stream a file (for preview)
router.get("/:id/stream", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const arquivo = await storage.getArquivoMidiaById(req.params.id);
    
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    if (arquivo.fileData.startsWith("mongo:")) {
      const parts = arquivo.fileData.split(":");
      const bucketName = parts.length === 3 ? parts[1] : "esp_files";
      const objectId = parts.length === 3 ? parts[2] : parts[1];

      res.setHeader("Content-Type", arquivo.contentType);
      const bucket = await getGridFSBucket(bucketName);
      const downloadStream = bucket.openDownloadStream(new ObjectId(objectId));
      downloadStream.on("error", () => res.status(404).json({ error: "Arquivo não encontrado" }));
      downloadStream.pipe(res);
    } else {
      const fileBuffer = Buffer.from(arquivo.fileData, "base64");

      res.setHeader("Content-Type", arquivo.contentType);
      res.setHeader("Content-Length", fileBuffer.length);
      res.send(fileBuffer);
    }
  } catch (error) {
    logger.error("Error streaming file", { error });
    res.status(500).json({ error: "Erro ao carregar arquivo" });
  }
});

// DELETE /api/files/:id - Delete a file
router.delete("/:id", authenticateToken, requireRole(...Permissions.createEsp), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const arquivo = await storage.getArquivoMidiaById(req.params.id);
    
    if (!arquivo) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    const deleted = await storage.deleteArquivoMidia(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({ error: "Erro ao deletar arquivo" });
    }

    await storage.createLog({
      userId: req.user.id,
      acao: "DELETE_ARQUIVO",
      alvo: arquivo.espId || arquivo.cadernoId || arquivo.id,
      detalhes: `Arquivo "${arquivo.filename}" deletado`,
    });

    logger.info("File deleted", { 
      fileId: req.params.id, 
      userId: req.user.id 
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting file", { error });
    res.status(500).json({ error: "Erro ao deletar arquivo" });
  }
});

export default router;
