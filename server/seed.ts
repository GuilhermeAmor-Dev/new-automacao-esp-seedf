import bcrypt from "bcrypt";
import { storage } from "./storage";
import { Perfil, StatusCaderno, Selo } from "@shared/schema";
import { logger } from "./utils/logger";

export async function seedDatabase() {
  try {
    logger.info("Starting database seed...");

    // Create 4 test users (one for each role)
    const users = [
      {
        nome: "João Arquiteto",
        email: "arquiteto@seedf.df.gov.br",
        senha: "Arquiteto123!",
        perfil: Perfil.ARQUITETO,
      },
      {
        nome: "Maria Chefe",
        email: "chefe@seedf.df.gov.br",
        senha: "Chefe123!",
        perfil: Perfil.CHEFE_DE_NUCLEO,
      },
      {
        nome: "Pedro Gerente",
        email: "gerente@seedf.df.gov.br",
        senha: "Gerente123!",
        perfil: Perfil.GERENTE,
      },
      {
        nome: "Ana Diretora",
        email: "diretor@seedf.df.gov.br",
        senha: "Diretor123!",
        perfil: Perfil.DIRETOR,
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await storage.getUserByEmail(userData.email);
      if (!existingUser) {
        const hashSenha = await bcrypt.hash(userData.senha, 10);
        const user = await storage.createUser({
          nome: userData.nome,
          email: userData.email,
          hashSenha,
          perfil: userData.perfil,
          ativo: true,
        });
        createdUsers.push(user);
        logger.info(`User created: ${userData.email}`);
      } else {
        createdUsers.push(existingUser);
        logger.info(`User already exists: ${userData.email}`);
      }
    }

    const arquiteto = createdUsers.find(u => u.perfil === Perfil.ARQUITETO);
    if (!arquiteto) {
      throw new Error("Arquiteto user not found");
    }

    // Create catalog data for Descrição e Aplicação
    // Constituintes
    const constituentesData = [
      { nome: "Argamassa de cimento e areia" },
      { nome: "Blocos cerâmicos" },
      { nome: "Blocos de concreto" },
      { nome: "Concreto estrutural" },
      { nome: "Aço CA-50" },
      { nome: "Aço CA-60" },
      { nome: "Tinta látex acrílica" },
      { nome: "Tinta epóxi" },
    ];

    for (const data of constituentesData) {
      const existing = await storage.getConstituenteByNome(data.nome);
      if (!existing) {
        await storage.createConstituinte(data);
        logger.info(`Constituinte created: ${data.nome}`);
      } else {
        logger.info(`Constituinte already exists: ${data.nome}`);
      }
    }

    // Acessórios
    const acessoriosData = [
      { nome: "Parafusos 3/8\"" },
      { nome: "Pregos 18x27" },
      { nome: "Buchas S8" },
      { nome: "Dobradiças 3\" cromadas" },
      { nome: "Fechadura com chave" },
      { nome: "Puxadores em alumínio" },
    ];

    for (const data of acessoriosData) {
      const existing = await storage.getAcessorioByNome(data.nome);
      if (!existing) {
        await storage.createAcessorio(data);
        logger.info(`Acessório created: ${data.nome}`);
      } else {
        logger.info(`Acessório already exists: ${data.nome}`);
      }
    }

    // Acabamentos
    const acabamentosData = [
      { nome: "Pintura lisa" },
      { nome: "Pintura texturizada" },
      { nome: "Revestimento cerâmico" },
      { nome: "Porcelanato" },
      { nome: "Gesso liso" },
      { nome: "Forro de PVC" },
    ];

    for (const data of acabamentosData) {
      const existing = await storage.getAcabamentoByNome(data.nome);
      if (!existing) {
        await storage.createAcabamento(data);
        logger.info(`Acabamento created: ${data.nome}`);
      } else {
        logger.info(`Acabamento already exists: ${data.nome}`);
      }
    }

    // Protótipos Comerciais
    const prototiposData = [
      { item: "Cano PVC 20mm", marca: "Tigre" },
      { item: "Cano PVC 20mm", marca: "Gravia" },
      { item: "Cano PVC 25mm", marca: "Tigre" },
      { item: "Barra de ferro 20x30mm", marca: "Gerdau" },
      { item: "Barra de ferro 20x30mm", marca: "Belgo" },
      { item: "Tinta látex 18L", marca: "Suvinil" },
      { item: "Tinta látex 18L", marca: "Coral" },
      { item: "Cimento 50kg", marca: "Votorantim" },
    ];

    for (const data of prototiposData) {
      const existing = await storage.getPrototipoComercialByItemMarca(data.item, data.marca);
      if (!existing) {
        await storage.createPrototipoComercial(data);
        logger.info(`Protótipo comercial created: ${data.item} - ${data.marca}`);
      } else {
        logger.info(`Protótipo comercial already exists: ${data.item} - ${data.marca}`);
      }
    }

    // Aplicações
    const aplicacoesData = [
      { nome: "Infraestrutura" },
      { nome: "Acabamento" },
      { nome: "Elétrica" },
      { nome: "Hidráulica" },
      { nome: "Estrutural" },
      { nome: "Revestimento" },
    ];

    for (const data of aplicacoesData) {
      const existing = await storage.getAplicacaoByNome(data.nome);
      if (!existing) {
        await storage.createAplicacao(data);
        logger.info(`Aplicação created: ${data.nome}`);
      } else {
        logger.info(`Aplicação already exists: ${data.nome}`);
      }
    }

    // Fichas de Recebimento
    const fichasRecebimentoData = [
      { nome: "Ficha de Recebimento de Materiais Hidráulicos", descricao: "Verificação de conformidade de materiais hidráulicos" },
      { nome: "Ficha de Conferência Elétrica", descricao: "Inspeção de materiais e instalações elétricas" },
      { nome: "Ficha de Recebimento de Estruturas Metálicas", descricao: "Controle de qualidade de estruturas metálicas" },
      { nome: "Ficha de Inspeção de Alvenaria", descricao: "Verificação de blocos e execução de alvenaria" },
      { nome: "Ficha de Recebimento de Revestimentos", descricao: "Controle de materiais de revestimento cerâmico e porcelanato" },
      { nome: "Ficha de Conferência de Pintura", descricao: "Inspeção de tintas e execução de pintura" },
      { nome: "Ficha de Recebimento de Materiais Estruturais", descricao: "Verificação de concreto, aço e outros materiais estruturais" },
    ];

    for (const data of fichasRecebimentoData) {
      const existing = await storage.getFichaRecebimentoByNome(data.nome);
      if (!existing) {
        await storage.createFichaRecebimento(data);
        logger.info(`Ficha de Recebimento created: ${data.nome}`);
      } else {
        logger.info(`Ficha de Recebimento already exists: ${data.nome}`);
      }
    }

    // Serviços Incluídos
    const servicosIncluidosData = [
      { nome: "Instalação do Componente", descricao: "Serviço de instalação de componente técnico" },
      { nome: "Montagem do Equipamento", descricao: "Montagem completa de equipamentos" },
      { nome: "Ajuste e Nivelamento", descricao: "Ajuste fino e nivelamento de estruturas" },
      { nome: "Limpeza Pós-Instalação", descricao: "Limpeza do local após instalação" },
      { nome: "Apiloamento do terreno", descricao: "Preparação e compactação do terreno" },
      { nome: "Base de concreto simples", descricao: "Execução de base em concreto simples" },
      { nome: "Piso com Revestimento", descricao: "Execução de piso com revestimento" },
      { nome: "Cobertura", descricao: "Execução de cobertura" },
      { nome: "Alvenaria com revestimentos (interno e externo)", descricao: "Execução de alvenaria com revestimentos interno e externo" },
      { nome: "Ralo e torneiras", descricao: "Instalação de ralos e torneiras" },
      { nome: "Lubrificação de partes móveis", descricao: "Serviço de lubrificação de partes móveis" },
    ];

    for (const data of servicosIncluidosData) {
      const existing = await storage.getServicoIncluidoByNome(data.nome);
      if (!existing) {
        await storage.createServicoIncluido(data);
        logger.info(`Serviço Incluído created: ${data.nome}`);
      } else {
        logger.info(`Serviço Incluído already exists: ${data.nome}`);
      }
    }

    
    // Skipping sample Caderno/ESP seeds to keep DB clean

// Create activity logs
    await storage.createLog({
      userId: arquiteto.id,
      acao: "SEED_DATABASE",
      alvo: "SYSTEM",
      detalhes: "Banco de dados populado com dados iniciais",
    });

    logger.info("Database seed completed (users/catalog only)!");
    logger.info("=".repeat(60));
    logger.info("Test Credentials:");
    logger.info("=".repeat(60));
    users.forEach(u => {
      logger.info(`${u.perfil}: ${u.email} / ${u.senha}`);
    });
    logger.info("=".repeat(60));

  } catch (error) {
    logger.error("Error seeding database", { error });
    throw error;
  }
}
