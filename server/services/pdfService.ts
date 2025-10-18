import PDFDocument from "pdfkit";
import { Esp, UserWithoutPassword } from "@shared/schema";

export async function generateEspPdf(
  esp: Esp,
  autor: UserWithoutPassword
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

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

      doc
        .fontSize(14)
        .text(esp.titulo, { align: "center" })
        .moveDown(2);

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

      // Content sections
      const sections = [
        { title: "DESCRIÇÃO E APLICAÇÃO", content: esp.descricaoAplicacao },
        { title: "EXECUÇÃO", content: esp.execucao },
        { title: "FICHAS DE REFERÊNCIA", content: esp.fichasReferencia },
        { title: "RECEBIMENTO", content: esp.recebimento },
        { title: "SERVIÇOS INCLUÍDOS", content: esp.servicosIncluidos },
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
    } catch (error) {
      reject(error);
    }
  });
}
