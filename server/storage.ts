import {
  type User,
  type InsertUser,
  type Caderno,
  type InsertCaderno,
  type Esp,
  type InsertEsp,
  type LogAtividade,
  type InsertLogAtividade,
  type ArquivoMidia,
  type InsertArquivoMidia,
  type UserWithoutPassword,
  StatusCaderno,
  Perfil,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserWithoutPassword(id: string): Promise<UserWithoutPassword | undefined>;
  
  // Caderno methods
  getCaderno(id: string): Promise<Caderno | undefined>;
  getCadernos(filters?: { status?: StatusCaderno; autorId?: string }): Promise<Caderno[]>;
  createCaderno(caderno: InsertCaderno): Promise<Caderno>;
  updateCaderno(id: string, updates: Partial<InsertCaderno>): Promise<Caderno | undefined>;
  deleteCaderno(id: string): Promise<boolean>;
  
  // ESP methods
  getEsp(id: string): Promise<Esp | undefined>;
  getEsps(filters?: { cadernoId?: string; visivel?: boolean }): Promise<Esp[]>;
  createEsp(esp: InsertEsp): Promise<Esp>;
  updateEsp(id: string, updates: Partial<InsertEsp>): Promise<Esp | undefined>;
  deleteEsp(id: string): Promise<boolean>;
  
  // ArquivoMidia methods
  getArquivosMidiaByEsp(espId: string): Promise<ArquivoMidia[]>;
  createArquivoMidia(arquivo: InsertArquivoMidia): Promise<ArquivoMidia>;
  deleteArquivoMidia(id: string): Promise<boolean>;
  
  // LogAtividade methods
  createLog(log: InsertLogAtividade): Promise<LogAtividade>;
  getLogs(userId?: string): Promise<LogAtividade[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cadernos: Map<string, Caderno>;
  private esps: Map<string, Esp>;
  private arquivosMidia: Map<string, ArquivoMidia>;
  private logs: Map<string, LogAtividade>;

  constructor() {
    this.users = new Map();
    this.cadernos = new Map();
    this.esps = new Map();
    this.arquivosMidia = new Map();
    this.logs = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      ativo: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserWithoutPassword(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const { hashSenha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Caderno methods
  async getCaderno(id: string): Promise<Caderno | undefined> {
    return this.cadernos.get(id);
  }

  async getCadernos(filters?: { status?: StatusCaderno; autorId?: string }): Promise<Caderno[]> {
    let cadernos = Array.from(this.cadernos.values());
    if (filters?.status) {
      cadernos = cadernos.filter(c => c.status === filters.status);
    }
    if (filters?.autorId) {
      cadernos = cadernos.filter(c => c.autorId === filters.autorId);
    }
    return cadernos;
  }

  async createCaderno(insertCaderno: InsertCaderno): Promise<Caderno> {
    const id = randomUUID();
    const now = new Date();
    const caderno: Caderno = {
      ...insertCaderno,
      id,
      status: insertCaderno.status || StatusCaderno.EM_ANDAMENTO,
      createdAt: now,
      updatedAt: now,
    };
    this.cadernos.set(id, caderno);
    return caderno;
  }

  async updateCaderno(id: string, updates: Partial<InsertCaderno>): Promise<Caderno | undefined> {
    const caderno = this.cadernos.get(id);
    if (!caderno) return undefined;
    
    const updated: Caderno = {
      ...caderno,
      ...updates,
      updatedAt: new Date(),
    };
    this.cadernos.set(id, updated);
    return updated;
  }

  async deleteCaderno(id: string): Promise<boolean> {
    return this.cadernos.delete(id);
  }

  // ESP methods
  async getEsp(id: string): Promise<Esp | undefined> {
    return this.esps.get(id);
  }

  async getEsps(filters?: { cadernoId?: string; visivel?: boolean }): Promise<Esp[]> {
    let esps = Array.from(this.esps.values());
    if (filters?.cadernoId) {
      esps = esps.filter(e => e.cadernoId === filters.cadernoId);
    }
    if (filters?.visivel !== undefined) {
      esps = esps.filter(e => e.visivel === filters.visivel);
    }
    return esps;
  }

  async createEsp(insertEsp: InsertEsp): Promise<Esp> {
    const id = randomUUID();
    const now = new Date();
    const esp: Esp = {
      ...insertEsp,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.esps.set(id, esp);
    return esp;
  }

  async updateEsp(id: string, updates: Partial<InsertEsp>): Promise<Esp | undefined> {
    const esp = this.esps.get(id);
    if (!esp) return undefined;
    
    const updated: Esp = {
      ...esp,
      ...updates,
      updatedAt: new Date(),
    };
    this.esps.set(id, updated);
    return updated;
  }

  async deleteEsp(id: string): Promise<boolean> {
    return this.esps.delete(id);
  }

  // ArquivoMidia methods
  async getArquivosMidiaByEsp(espId: string): Promise<ArquivoMidia[]> {
    return Array.from(this.arquivosMidia.values()).filter(
      arquivo => arquivo.espId === espId
    );
  }

  async createArquivoMidia(insertArquivo: InsertArquivoMidia): Promise<ArquivoMidia> {
    const id = randomUUID();
    const arquivo: ArquivoMidia = {
      ...insertArquivo,
      id,
      createdAt: new Date(),
    };
    this.arquivosMidia.set(id, arquivo);
    return arquivo;
  }

  async deleteArquivoMidia(id: string): Promise<boolean> {
    return this.arquivosMidia.delete(id);
  }

  // LogAtividade methods
  async createLog(insertLog: InsertLogAtividade): Promise<LogAtividade> {
    const id = randomUUID();
    const log: LogAtividade = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.logs.set(id, log);
    return log;
  }

  async getLogs(userId?: string): Promise<LogAtividade[]> {
    const allLogs = Array.from(this.logs.values());
    if (userId) {
      return allLogs.filter(log => log.userId === userId);
    }
    return allLogs;
  }
}

export const storage = new MemStorage();
