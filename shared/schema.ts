import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export enum Perfil {
  ARQUITETO = "ARQUITETO",
  CHEFE_DE_NUCLEO = "CHEFE_DE_NUCLEO",
  GERENTE = "GERENTE",
  DIRETOR = "DIRETOR"
}

export enum StatusCaderno {
  OBSOLETO = "OBSOLETO",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  APROVADO = "APROVADO"
}

export enum Selo {
  AMBIENTAL = "AMBIENTAL",
  NENHUM = "NENHUM"
}

export enum TipoArquivo {
  IMAGEM = "IMAGEM",
  PDF = "PDF",
  DOCX = "DOCX"
}

// User model
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  hashSenha: text("hash_senha").notNull(),
  perfil: text("perfil").notNull().$type<Perfil>(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Caderno model
export const cadernos = pgTable("cadernos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  status: text("status").notNull().$type<StatusCaderno>().default(StatusCaderno.EM_ANDAMENTO),
  autorId: varchar("autor_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCadernoSchema = createInsertSchema(cadernos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCaderno = z.infer<typeof insertCadernoSchema>;
export type Caderno = typeof cadernos.$inferSelect;

// ESP model
export const esps = pgTable("esps", {
  id: varchar("id", { length: 36 }).primaryKey(),
  codigo: text("codigo").notNull().unique(),
  titulo: text("titulo").notNull(),
  tipologia: text("tipologia").notNull(),
  revisao: text("revisao").notNull(),
  dataPublicacao: timestamp("data_publicacao").notNull(),
  autorId: varchar("autor_id", { length: 36 }).notNull().references(() => users.id),
  selo: text("selo").notNull().$type<Selo>().default(Selo.NENHUM),
  cadernoId: varchar("caderno_id", { length: 36 }).notNull().references(() => cadernos.id),
  visivel: boolean("visivel").notNull().default(true),
  descricaoAplicacao: text("descricao_aplicacao"),
  execucao: text("execucao"),
  fichasReferencia: text("fichas_referencia"),
  recebimento: text("recebimento"),
  servicosIncluidos: text("servicos_incluidos"),
  criteriosMedicao: text("criterios_medicao"),
  legislacao: text("legislacao"),
  referencias: text("referencias"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEspSchema = createInsertSchema(esps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEsp = z.infer<typeof insertEspSchema>;
export type Esp = typeof esps.$inferSelect;

// Versao model
export const versoes = pgTable("versoes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  espId: varchar("esp_id", { length: 36 }).notNull().references(() => esps.id),
  numero: integer("numero").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVersaoSchema = createInsertSchema(versoes).omit({
  id: true,
  createdAt: true,
});

export type InsertVersao = z.infer<typeof insertVersaoSchema>;
export type Versao = typeof versoes.$inferSelect;

// ArquivoMidia model
export const arquivosMidia = pgTable("arquivos_midia", {
  id: varchar("id", { length: 36 }).primaryKey(),
  espId: varchar("esp_id", { length: 36 }).notNull().references(() => esps.id),
  tipo: text("tipo").notNull().$type<TipoArquivo>(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileData: text("file_data").notNull(), // Base64-encoded file data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertArquivoMidiaSchema = createInsertSchema(arquivosMidia).omit({
  id: true,
  createdAt: true,
});

export type InsertArquivoMidia = z.infer<typeof insertArquivoMidiaSchema>;
export type ArquivoMidia = typeof arquivosMidia.$inferSelect;

// LogAtividade model
export const logsAtividade = pgTable("logs_atividade", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  acao: text("acao").notNull(),
  alvo: text("alvo").notNull(),
  detalhes: text("detalhes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLogAtividadeSchema = createInsertSchema(logsAtividade).omit({
  id: true,
  createdAt: true,
});

export type InsertLogAtividade = z.infer<typeof insertLogAtividadeSchema>;
export type LogAtividade = typeof logsAtividade.$inferSelect;

// Extended types for frontend use
export type UserWithoutPassword = Omit<User, 'hashSenha'>;

export type CadernoWithAutor = Caderno & {
  autor: UserWithoutPassword;
};

export type EspWithRelations = Esp & {
  autor: UserWithoutPassword;
  caderno: Caderno;
  arquivos?: ArquivoMidia[];
};

export type LogAtividadeWithUser = LogAtividade & {
  user: UserWithoutPassword;
};
