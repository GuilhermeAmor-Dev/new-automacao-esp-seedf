import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { Esp, UserWithoutPassword } from "@shared/schema";

export async function generateEspDocx(
  esp: Esp,
  autor: UserWithoutPassword
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "SEEDF - Sistema ESP",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `ESP: ${esp.codigo}`,
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: esp.titulo,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Identification
          new Paragraph({
            text: "IDENTIFICAÇÃO",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            text: `Tipologia: ${esp.tipologia}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Código: ${esp.codigo}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Revisão: ${esp.revisao}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Data de Publicação: ${new Date(esp.dataPublicacao).toLocaleDateString("pt-BR")}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Autor: ${autor.nome}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Selo: ${esp.selo}`,
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: `Visível: ${esp.visivel ? "Sim" : "Não"}`,
            spacing: { after: 400 },
          }),

          // Content sections
          ...(esp.descricaoAplicacao
            ? [
                new Paragraph({
                  text: "DESCRIÇÃO E APLICAÇÃO",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.descricaoAplicacao,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.execucao
            ? [
                new Paragraph({
                  text: "EXECUÇÃO",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.execucao,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.fichasReferencia
            ? [
                new Paragraph({
                  text: "FICHAS DE REFERÊNCIA",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.fichasReferencia,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.recebimento
            ? [
                new Paragraph({
                  text: "RECEBIMENTO",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.recebimento,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.servicosIncluidos
            ? [
                new Paragraph({
                  text: "SERVIÇOS INCLUÍDOS",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.servicosIncluidos,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.criteriosMedicao
            ? [
                new Paragraph({
                  text: "CRITÉRIOS DE MEDIÇÃO",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.criteriosMedicao,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.legislacao
            ? [
                new Paragraph({
                  text: "LEGISLAÇÃO",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.legislacao,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          ...(esp.referencias
            ? [
                new Paragraph({
                  text: "REFERÊNCIAS",
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: esp.referencias,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
                size: 18,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
