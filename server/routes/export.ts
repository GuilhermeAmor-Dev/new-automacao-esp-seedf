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

      // Imagens da ESP e dos cadernos associados
      const images: { filename: string; buffer: Buffer }[] = [];
      const pushFile = async (file: any, labelPrefix?: string) => {
        if (file.tipo !== TipoArquivo.IMAGEM) return;
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
          images.push({ filename: labelPrefix ? `${labelPrefix} - ${file.filename}` : file.filename, buffer });
        } catch (err) {
          logger.error("Error loading image for PDF", { fileId: file.id, err });
        }
      };

      const espFiles = await storage.getArquivosMidiaByEsp(esp.id);
      for (const file of espFiles) await pushFile(file);

      const cadernosAssociados = esp.cadernosIds?.length ? await storage.getCadernosByIds(esp.cadernosIds) : [];
      for (const cad of cadernosAssociados) {
        const cadFiles = await storage.getArquivosMidiaByCaderno(cad.id);
        for (const file of cadFiles) await pushFile(file, `Caderno ${cad.titulo}`);
      }

      // Catálogos (itens_especificacao ativos)
      const itensAtivos = await storage.getItensEspecificacao({ ativo: true });
      const toBullets = (values: string[]) =>
        values.filter(Boolean).map((value) => `* ${value}`).join("\n");

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

      const resolveIds = async (
        ids: string[] | null | undefined,
        resolver: (ids?: string[] | null) => Promise<string>
      ) => {
        if (!ids?.length) return "";
        return resolver(ids);
      };

      const sectionText = async (
        espValue: string | null | undefined,
        field: keyof typeof esp,
        resolver?: (ids?: string[] | null) => Promise<string>
      ) => {
        const parts: string[] = [];
        if (espValue && String(espValue).trim()) {
          parts.push(`ESP:\n${espValue}`);
        }
        for (const cad of cadernosAssociados) {
          const raw = (cad as any)[field];
          if (resolver) {
            const resolved = await resolveIds(raw, resolver);
            if (resolved) {
              parts.push(`Caderno ${cad.titulo}:\n${resolved}`);
            }
          } else if (raw && String(raw).trim()) {
            parts.push(`Caderno ${cad.titulo}:\n${raw}`);
          }
        }
        return parts.join("\n\n---\n\n");
      };

      const espCombinada = {
        ...esp,
        descricaoAplicacao: await sectionText(esp.descricaoAplicacao, "descricaoAplicacao"),
        execucao: await sectionText(esp.execucao, "execucao"),
        fichasReferencia: await sectionText(esp.fichasReferencia, "fichasReferencia"),
        recebimento: await sectionText(esp.recebimento, "recebimento"),
        servicosIncluidos: await sectionText(esp.servicosIncluidos, "servicosIncluidos"),
        criteriosMedicao: await sectionText(esp.criteriosMedicao, "criteriosMedicao"),
        legislacao: await sectionText(esp.legislacao, "legislacao"),
        referencias: await sectionText(esp.referencias, "referencias"),
      };

      const constituinteTexto = await sectionText("", "constituentesIds", makeLookup(constituintes, (i) => i.nome));
      const acessorioTexto = await sectionText("", "acessoriosIds", makeLookup(acessorios, (i) => i.nome));
      const acabamentoTexto = await sectionText("", "acabamentosIds", makeLookup(acabamentos, (i) => i.nome));
      const prototipoTexto = await sectionText("", "prototiposIds", makeLookup(
        prototipos,
        (item) => (item.marca ? `${item.item} (${item.marca})` : item.item)
      ));
      const aplicacaoTexto = await sectionText("", "aplicacoesIds", makeLookup(aplicacoes, (i) => i.nome));
      const execConstTexto = await sectionText("", "constituentesExecucaoIds", makeLookup(constituintes, (i) => i.nome));
      const fichasRefTexto = await sectionText("", "fichasReferenciaIds", makeLookup(fichasRecebimento, (i) => i.nome));
      const fichasRecebTexto = await sectionText("", "fichasRecebimentoIds", makeLookup(fichasRecebimento, (i) => i.nome));
      const servicosInclTexto = await sectionText("", "servicosIncluidosIds", makeLookup(servicosIncluidosCatalog, (i) => (i.descricao ? `${i.nome} - ${i.descricao}` : i.nome)));

      const append = (base: string, extra: string, label: string) => {
        if (!extra) return base;
        return [base, `${label}\n${extra}`].filter(Boolean).join("\n\n---\n\n");
      };

      espCombinada.descricaoAplicacao = append(espCombinada.descricaoAplicacao, constituinteTexto, "Constituintes");
      espCombinada.descricaoAplicacao = append(espCombinada.descricaoAplicacao, acessorioTexto, "Acessórios");
      espCombinada.descricaoAplicacao = append(espCombinada.descricaoAplicacao, acabamentoTexto, "Acabamentos");
      espCombinada.descricaoAplicacao = append(espCombinada.descricaoAplicacao, prototipoTexto, "Protótipo Comercial");
      espCombinada.descricaoAplicacao = append(espCombinada.descricaoAplicacao, aplicacaoTexto, "Aplicação");
      espCombinada.execucao = append(espCombinada.execucao, execConstTexto, "Constituintes (Execução)");
      espCombinada.fichasReferencia = append(espCombinada.fichasReferencia, fichasRefTexto, "Fichas de Referência");
      espCombinada.recebimento = append(espCombinada.recebimento, fichasRecebTexto, "Fichas de Recebimento");
      espCombinada.servicosIncluidos = append(espCombinada.servicosIncluidos, servicosInclTexto, "Serviços Incluídos (Lista)");

      const pdfBuffer = await generateEspPdf(espCombinada, {
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
