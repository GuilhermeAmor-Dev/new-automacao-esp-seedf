import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireRole, Permissions } from "../middleware/rbac";
import { validateParams } from "../middleware/validate";
import { generateEspPdf, generateCadernoPdf } from "../services/pdfService";
import { generateEspDocx, generateCadernoDocx } from "../services/docxService";
import { logger } from "../utils/logger";
import { readGridFSFileToBuffer } from "../mongo";
import { TipoArquivo, CategoriaItem, SubcategoriaItem } from "@shared/schema";

const router = Router();

const paramsSchema = z.object({
  espId: z.string(),
});
const cadernoParamsSchema = z.object({
  cadernoId: z.string(),
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

      // Catálogos derivam de itens_especificacao
      const itensAtivos = await storage.getItensEspecificacao({ ativo: true });
      const toBullets = (values: string[]) =>
        values.filter(Boolean).map((value) => `• ${value}`).join("\n");

      const makeLookup = <T extends { id: string }>(
        items: T[],
        getLabel: (item: T) => string
      ) => {
        const map = new Map(items.map((item) => [item.id, getLabel(item)]));
        return async (ids?: string[] | null) => {
          if (!ids?.length) return "";
          const labels = ids
            .map((id) => map.get(id))
            .filter(Boolean) as string[];
          return toBullets(labels);
        };
      };

      const constituintes = itensAtivos
        .filter((i) => i.subcategoria === CategoriaItem.CONSTITUINTES)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const acessorios = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.ACESSORIOS)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const acabamentos = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.ACABAMENTOS)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const prototipos = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.PROTOTIPO_COMERCIAL)
        .map((i) => ({ id: i.id, item: i.titulo, marca: "" }));
      const aplicacoes = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.APLICACAO)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const fichasRecebimento = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.RECEBIMENTO)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const servicosIncluidosCatalog = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.SERVICOS_INCLUIDOS)
        .map((i) => ({ id: i.id, nome: i.titulo, descricao: i.descricao ?? "" }));

      const pdfBuffer = await generateEspPdf(esp, {
        autor,
        images,
        getConstituintesText: makeLookup(constituintes, (item) => item.nome),
        getAcessoriosText: makeLookup(acessorios, (item) => item.nome),
        getAcabamentosText: makeLookup(acabamentos, (item) => item.nome),
        getPrototiposText: makeLookup(
          prototipos,
          (item) => (item.marca ? `${item.item} (${item.marca})` : item.item)
        ),
        getAplicacoesText: makeLookup(aplicacoes, (item) => item.nome),
        getFichasRecebimentoText: makeLookup(
          fichasRecebimento,
          (item) => item.nome
        ),
        getServicosIncluidosText: makeLookup(
          servicosIncluidosCatalog,
          (item) => (item.descricao ? `${item.nome} - ${item.descricao}` : item.nome)
        ),
      });

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

// POST /api/export/pdf-caderno/:cadernoId
router.post(
  "/pdf-caderno/:cadernoId",
  authenticateToken,
  requireRole(...Permissions.exportPdf),
  validateParams(cadernoParamsSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Nǜo autenticado" });
      }

      const caderno = await storage.getCaderno(req.params.cadernoId);
      if (!caderno) {
        return res.status(404).json({ error: "Caderno nǜo encontrado" });
      }

      const autor = await storage.getUserWithoutPassword(caderno.autorId);
      if (!autor) {
        return res.status(404).json({ error: "Autor nǜo encontrado" });
      }

      // Buscar arquivos vinculados ao caderno
      const files = await storage.getArquivosMidiaByCaderno(caderno.id);
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
          logger.error("Error loading image for Caderno PDF", { fileId: file.id, err });
        }
      }

      const itensAtivos = await storage.getItensEspecificacao({ ativo: true });

      const toBullets = (values: string[]) =>
        values.filter(Boolean).map((value) => `• ${value}`).join("\n");

      const makeLookup = <T extends { id: string }>(
        items: T[],
        getLabel: (item: T) => string
      ) => {
        const map = new Map(items.map((item) => [item.id, getLabel(item)]));
        return async (ids?: string[] | null) => {
          if (!ids?.length) return "";
          const labels = ids
            .map((id) => map.get(id))
            .filter(Boolean) as string[];
          return toBullets(labels);
        };
      };

      const constituintes = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.CONSTITUINTES)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const acessorios = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.ACESSORIOS)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const acabamentos = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.ACABAMENTOS)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const prototipos = itensAtivos
        .filter((i) => i.subcategoria === SubcategoriaItem.PROTOTIPO_COMERCIAL)
        .map((i) => ({ id: i.id, item: i.titulo, marca: "" }));
      const aplicacoes = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.APLICACAO)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const fichasRecebimento = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.RECEBIMENTO)
        .map((i) => ({ id: i.id, nome: i.titulo }));
      const servicosIncluidosCatalog = itensAtivos
        .filter((i) => i.categoria === CategoriaItem.SERVICOS_INCLUIDOS)
        .map((i) => ({ id: i.id, nome: i.titulo, descricao: i.descricao ?? "" }));

      const pdfBuffer = await generateCadernoPdf(caderno, {
        autor,
        images,
        lookups: {
          getConstituintesText: makeLookup(constituintes, (item) => item.nome),
          getAcessoriosText: makeLookup(acessorios, (item) => item.nome),
          getAcabamentosText: makeLookup(acabamentos, (item) => item.nome),
          getPrototiposText: makeLookup(
            prototipos,
            (item) => (item.marca ? `${item.item} (${item.marca})` : item.item)
          ),
          getAplicacoesText: makeLookup(aplicacoes, (item) => item.nome),
          getFichasRecebimentoText: makeLookup(
            fichasRecebimento,
            (item) => item.nome
          ),
          getServicosIncluidosText: makeLookup(
            servicosIncluidosCatalog,
            (item) => (item.descricao ? `${item.nome} - ${item.descricao}` : item.nome)
          ),
        },
      });

      await storage.createLog({
        userId: req.user.id,
        acao: "EXPORTAR_PDF",
        alvo: caderno.id,
        detalhes: `PDF exportado para Caderno "${caderno.titulo}"`,
      });

      logger.info("PDF caderno exported", { cadernoId: caderno.id, userId: req.user.id });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${caderno.titulo}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error("Error exporting Caderno PDF", { error });
      res.status(500).json({ error: "Erro ao exportar PDF do caderno" });
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

// POST /api/export/docx-caderno/:cadernoId
router.post(
  "/docx-caderno/:cadernoId",
  authenticateToken,
  requireRole(...Permissions.exportDocx),
  validateParams(cadernoParamsSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Nǜo autenticado" });
      }

      const caderno = await storage.getCaderno(req.params.cadernoId);
      if (!caderno) {
        return res.status(404).json({ error: "Caderno nǜo encontrado" });
      }

      const autor = await storage.getUserWithoutPassword(caderno.autorId);
      if (!autor) {
        return res.status(404).json({ error: "Autor nǜo encontrado" });
      }

      const docxBuffer = await generateCadernoDocx(caderno, autor);

      await storage.createLog({
        userId: req.user.id,
        acao: "EXPORTAR_DOCX",
        alvo: caderno.id,
        detalhes: `DOCX exportado para Caderno "${caderno.titulo}"`,
      });

      logger.info("DOCX caderno exported", { cadernoId: caderno.id, userId: req.user.id });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${caderno.titulo}.docx"`);
      res.send(docxBuffer);
    } catch (error) {
      logger.error("Error exporting Caderno DOCX", { error });
      res.status(500).json({ error: "Erro ao exportar DOCX do caderno" });
    }
  }
);

export default router;
