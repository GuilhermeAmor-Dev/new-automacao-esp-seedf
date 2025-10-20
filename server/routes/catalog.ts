import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, type AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/catalog/constituintes - List all constituintes
router.get("/constituintes", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const constituintes = await storage.getConstituintes();
    res.json({ constituintes });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar constituintes" });
  }
});

// GET /api/catalog/acessorios - List all acessórios
router.get("/acessorios", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const acessorios = await storage.getAcessorios();
    res.json({ acessorios });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar acessórios" });
  }
});

// GET /api/catalog/acabamentos - List all acabamentos
router.get("/acabamentos", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const acabamentos = await storage.getAcabamentos();
    res.json({ acabamentos });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar acabamentos" });
  }
});

// GET /api/catalog/prototipos - List all protótipos comerciais
router.get("/prototipos", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const prototipos = await storage.getPrototiposComerciais();
    res.json({ prototipos });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar protótipos comerciais" });
  }
});

// GET /api/catalog/aplicacoes - List all aplicações
router.get("/aplicacoes", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const aplicacoes = await storage.getAplicacoes();
    res.json({ aplicacoes });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar aplicações" });
  }
});

// GET /api/catalog/fichas-recebimento - List all fichas de recebimento
router.get("/fichas-recebimento", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const fichasRecebimento = await storage.getFichasRecebimento();
    res.json({ fichasRecebimento });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar fichas de recebimento" });
  }
});

export default router;
