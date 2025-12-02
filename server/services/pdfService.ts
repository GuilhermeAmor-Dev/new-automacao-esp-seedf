import PDFDocument from "pdfkit";
import { Esp, Caderno, UserWithoutPassword } from "@shared/schema";

type ItemLookup = (ids?: string[] | null) => Promise<string>;

interface PdfOptions {
  autor: UserWithoutPassword;
  images?: { filename: string; buffer: Buffer }[];
  getConstituintesText?: ItemLookup;
  getAcessoriosText?: ItemLookup;
  getAcabamentosText?: ItemLookup;
  getPrototiposText?: ItemLookup;
  getAplicacoesText?: ItemLookup;
  getServicosIncluidosText?: ItemLookup;
  getFichasRecebimentoText?: ItemLookup;
}

export async function generateEspPdf(
  esp: Esp,
  {
    autor,
    images,
    getConstituintesText,
    getAcessoriosText,
    getAcabamentosText,
    getPrototiposText,
    getAplicacoesText,
    getServicosIncluidosText,
    getFichasRecebimentoText,
  }: PdfOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fontSize(20)
        .fillColor("#0361ad")
        .text("SEEDF - Sistema ESP", { align: "center" })
        .moveDown();

      doc
        .fontSize(16)
        .fillColor("#000000")
        .text(`ESP: ${esp.codigo}`, { align: "center" })
        .moveDown(0.5);

      doc.fontSize(14).text(esp.titulo, { align: "center" }).moveDown(2);

      // Identification section
      doc.fontSize(12).fillColor("#0361ad").text("IDENTIFICAÇÃO", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor("#000000");
      doc.text(`Tipologia: ${esp.tipologia}`);
      doc.text(`Código: ${esp.codigo}`);
      doc.text(`Revisão: ${esp.revisao}`);
      doc.text(`Data de Publicação: ${new Date(esp.dataPublicacao).toLocaleDateString("pt-BR")}`);
      doc.text(`Autor: ${autor.nome}`);
      doc.text(`Selo: ${esp.selo}`);
      doc.text(`Visível: ${esp.visivel ? "Sim" : "Não"}`);
      doc.moveDown(1.5);

      // Project images logo após identificação
      if (images && images.length > 0) {
        images.forEach((img, index) => {
          doc.addPage();
          doc.fontSize(12).fillColor("#0361ad").text("PROJETOS", { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor("#000000").text(img.filename || `Imagem ${index + 1}`);
          doc.moveDown(0.5);
          try {
            doc.image(img.buffer, {
              fit: [500, 500],
              align: "center",
              valign: "center",
            });
          } catch {
            doc.fontSize(10).fillColor("#ff0000").text("Erro ao carregar imagem.");
          }
        });
      }

      // Build dynamic lists from lookup helpers
      const descAplicacaoParts: string[] = [];
      const execParts: string[] = [];
      const recebParts: string[] = [];
      const servicosParts: string[] = [];

      const addIf = (txt?: string | null) => (txt && txt.trim() ? txt.trim() : undefined);

      Promise.all([
        getConstituintesText?.(esp.constituentesIds),
        getAcessoriosText?.(esp.acessoriosIds),
        getAcabamentosText?.(esp.acabamentosIds),
        getPrototiposText?.(esp.prototiposIds),
        getAplicacoesText?.(esp.aplicacoesIds),
        getConstituintesText?.(esp.constituintesExecucaoIds),
        getFichasRecebimentoText?.(esp.fichasRecebimentoIds),
        getServicosIncluidosText?.(esp.servicosIncluidosIds),
      ]).then(
        ([
          constituinteTxt,
          acessorioTxt,
          acabamentoTxt,
          prototipoTxt,
          aplicacaoTxt,
          execConstTxt,
          recebTxt,
          servicosTxt,
        ]) => {
          // Descrição e Aplicação
          descAplicacaoParts.push(addIf(esp.descricaoAplicacao) || "");
          addIf(constituinteTxt) && descAplicacaoParts.push(`Constituintes:\n${constituinteTxt}`);
          addIf(acessorioTxt) && descAplicacaoParts.push(`Acessórios:\n${acessorioTxt}`);
          addIf(acabamentoTxt) && descAplicacaoParts.push(`Acabamentos:\n${acabamentoTxt}`);
          addIf(prototipoTxt) && descAplicacaoParts.push(`Protótipo Comercial:\n${prototipoTxt}`);
          addIf(aplicacaoTxt) && descAplicacaoParts.push(`Aplicação:\n${aplicacaoTxt}`);

          // Execução
          execParts.push(addIf(esp.execucao) || "");
          addIf(execConstTxt) && execParts.push(`Constituintes (Execução):\n${execConstTxt}`);

          // Recebimento
          recebParts.push(addIf(esp.recebimento) || "");
          addIf(recebTxt) && recebParts.push(`Fichas de Recebimento:\n${recebTxt}`);

          // Serviços incluídos
          servicosParts.push(addIf(esp.servicosIncluidos) || "");
          addIf(servicosTxt) && servicosParts.push(`Serviços da lista:\n${servicosTxt}`);

          const sections = [
            { title: "DESCRIÇÃO E APLICAÇÃO", content: descAplicacaoParts.filter(Boolean).join("\n\n") },
            { title: "EXECUÇÃO", content: execParts.filter(Boolean).join("\n\n") },
            { title: "FICHAS DE REFERÊNCIA", content: esp.fichasReferencia },
            { title: "RECEBIMENTO", content: recebParts.filter(Boolean).join("\n\n") },
            { title: "SERVIÇOS INCLUÍDOS", content: servicosParts.filter(Boolean).join("\n\n") },
            { title: "CRITÉRIOS DE MEDIÇÃO", content: esp.criteriosMedicao },
            { title: "LEGISLAÇÃO", content: esp.legislacao },
            { title: "REFERÊNCIAS", content: esp.referencias },
          ];

          sections.forEach((section) => {
            if (section.content) {
              doc.fontSize(12).fillColor("#0361ad").text(section.title, { underline: true });
              doc.moveDown(0.5);
              doc.fontSize(10).fillColor("#000000").text(section.content);
              doc.moveDown(1.5);
            }
          });

          // Footer
          doc
            .fontSize(8)
            .fillColor("#666666")
            .text(
              `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
              50,
              doc.page.height - 50,
              { align: "center" }
            );

          doc.end();
        }
      ).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateCadernoPdf(
  caderno: Caderno,
  {
    autor,
    images,
  }: {
    autor: UserWithoutPassword;
    images?: { filename: string; buffer: Buffer }[];
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).fillColor("#0361ad").text("SEEDF - Sistema ESP", { align: "center" }).moveDown();
      doc.fontSize(16).fillColor("#000").text(`Caderno`, { align: "center" }).moveDown(0.5);
      doc.fontSize(14).text(caderno.titulo, { align: "center" }).moveDown(2);

      doc.fontSize(12).fillColor("#0361ad").text("INFORMAÇÕES DO CADERNO", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#000");
      doc.text(`Título: ${caderno.titulo}`);
      doc.text(`Status: ${caderno.status}`);
      doc.text(`Autor: ${autor.nome}`);
      doc.text(`Criado em: ${new Date(caderno.createdAt).toLocaleDateString("pt-BR")}`);
      doc.text(`Atualizado em: ${new Date(caderno.updatedAt).toLocaleDateString("pt-BR")}`);
      doc.moveDown(1.5);

      if (caderno.descricao) {
        doc.fontSize(12).fillColor("#0361ad").text("DESCRIÇÃO", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#000").text(caderno.descricao);
        doc.moveDown(1.5);
      }

      if (images && images.length > 0) {
        images.forEach((img, index) => {
          doc.addPage();
          doc.fontSize(12).fillColor("#0361ad").text("PROJETOS", { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10).fillColor("#000").text(img.filename || `Imagem ${index + 1}`);
          doc.moveDown(0.5);
          try {
            doc.image(img.buffer, {
              fit: [500, 500],
              align: "center",
              valign: "center",
            });
          } catch {
            doc.fontSize(10).fillColor("#ff0000").text("Erro ao carregar imagem.");
          }
        });
      }

      doc
        .fontSize(8)
        .fillColor("#666")
        .text(
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
          50,
          doc.page.height - 50,
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
