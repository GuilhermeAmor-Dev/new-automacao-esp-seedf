## Guia rápido para rodar o projeto localmente

### 1) Pré-requisitos
- Node.js 22 instalado.
- Postgres rodando localmente (porta 5432) com um banco criado, ex.: `automacao_esp`.
- MongoDB rodando localmente (porta 27017) para armazenar uploads.

### 2) Clonar e instalar
```bash
git clone <URL-do-repo>
cd new-automacao-esp-seedf
npm install
```

### 3) Configurar variáveis de ambiente
Crie `.env` na raiz (ou exporte na sessão):
```
DATABASE_URL=postgresql://postgres:SENHA@localhost:5432/automacao_esp?sslmode=disable
JWT_SECRET=sua_chave_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
No PowerShell, para a sessão atual:
```powershell
$env:DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/automacao_esp?sslmode=disable"
$env:JWT_SECRET="sua_chave_segura"
```

### 4) Migrar o banco (Postgres)
```bash
npm run db:push
```

### 5) Subir MongoDB
- Inicie o serviço `mongod` local (porta padrão 27017).

### 6) Rodar em modo desenvolvimento
```bash
npm run dev
```
- Backend + Vite servindo em http://localhost:5000

### 7) Acessar
- Login: http://localhost:5000/login (usuários seed já criados no banco).
- Dashboard: http://localhost:5000/dashboard

### 8) Exportações e uploads
- Uploads de mídia (imagens/PDF/DOCX) exigem registro salvo (caderno ou ESP) e Mongo ativo.
- Export PDF: botões no dashboard ou `/api/export/pdf/:id` (ESP) e `/api/export/pdf-caderno/:id` (caderno).

### 9) Solução de problemas comuns
- “DATABASE_URL environment variable is required”: conferir `.env` ou exports no shell.
- Upload 404 em caderno: verifique se `cadernoId` existe (salve primeiro) e Mongo está rodando.
- Portas ocupadas: ajuste `DATABASE_URL` ou pare serviços que usem 5000/5432/27017.
