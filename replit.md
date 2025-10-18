# Sistema de Automação ESP - SEEDF

## Visão Geral
Sistema de automação do Caderno de Especificações (ESP) da Secretaria de Estado de Educação do Distrito Federal (SEEDF). Aplicação governamental institucional com identidade visual oficial e conformidade WCAG AA.

## Arquitetura
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Wouter (SPA)
- **Backend**: Express + TypeScript + Prisma (SQLite dev, PostgreSQL ready) + MongoDB GridFS
- **Autenticação**: JWT + httpOnly cookies
- **Validação**: Zod em frontend e backend
- **UI Components**: Shadcn/ui + Radix UI

## Estrutura do Projeto

```
/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── InstitutionalButton.tsx
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── AuthHeader.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── UploadDropzone.tsx
│   │   │   └── ui/            # Shadcn components
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── landing.tsx    # Página inicial (/)
│   │   │   ├── register.tsx   # Registro (/register)
│   │   │   ├── login.tsx      # Login (/login)
│   │   │   ├── recover.tsx    # Recuperação de senha (/recover)
│   │   │   ├── loading.tsx    # Transição (/loading)
│   │   │   ├── dashboard.tsx  # Dashboard principal (/dashboard)
│   │   │   ├── dashboard-results.tsx  # Resultados (/dashboard/results)
│   │   │   └── esp-editor.tsx # Editor ESP (/esp/:id/:tab?)
│   │   ├── lib/
│   │   │   ├── auth.ts        # Utilitários de autenticação
│   │   │   └── queryClient.ts # TanStack Query config
│   │   ├── App.tsx            # Rotas principais
│   │   └── index.css          # Cores institucionais
├── server/                    # Backend Express
│   ├── routes.ts             # Rotas da API
│   └── storage.ts            # Interface de storage (MemStorage)
├── shared/
│   └── schema.ts             # Schemas compartilhados (Drizzle + Zod)
└── design_guidelines.md      # Guidelines de design institucional
```

## Identidade Visual Institucional

### Cores Oficiais SEEDF
- **Azul Institucional**: `#0361ad` (203 96% 34%) - Headers, ações primárias
- **Amarelo Institucional**: `#fae947` (55 96% 64%) - Acentos, hover states
- **Branco**: `#ffffff` - Backgrounds de conteúdo
- **Preto**: `#000000` - Texto sobre fundos claros

### Conformidade de Acessibilidade
- WCAG AA compliant
- Contraste Azul/Branco: 9.6:1
- Contraste Amarelo/Preto: 13.5:1
- Navegação por teclado completa
- ARIA labels em todos elementos interativos
- Focus states com outline amarelo

## Modelos de Dados

### User
- **Perfis**: ARQUITETO, CHEFE_DE_NUCLEO, GERENTE, DIRETOR
- Campos: id, nome, email, hashSenha, perfil, ativo, createdAt

### Caderno
- **Status**: OBSOLETO, EM_ANDAMENTO, APROVADO
- Campos: id, titulo, descricao, status, autorId, createdAt, updatedAt

### ESP (Especificação)
- **Selo**: AMBIENTAL, NENHUM
- Campos: id, codigo, titulo, tipologia, revisao, dataPublicacao, autorId, selo, cadernoId, visivel, [campos de conteúdo], createdAt, updatedAt

### ArquivoMidia
- **Tipos**: IMAGEM, PDF, DOCX
- Integração com MongoDB GridFS
- Campos: id, espId, tipo, filename, contentType, fileIdMongo, createdAt

### LogAtividade
- Auditoria de todas as ações
- Campos: id, userId, acao, alvo, detalhes, createdAt

## Fluxo de Navegação

### Páginas Públicas
1. **/** - Landing page com design tricolor (azul-amarelo-azul)
2. **/register** - Registro de usuário com validação de e-mail institucional
3. **/login** - Autenticação com "Lembrar-me" e recuperação de senha
4. **/recover** - Recuperação de senha por e-mail
5. **/loading** - Tela de transição (1.5s) após login

### Páginas Privadas (requer autenticação)
6. **/dashboard** - Painel principal com filtros e ações
7. **/dashboard/results** - Listagem de documentos com ações (visualizar, editar, baixar PDF)
8. **/esp/:id/:tab?** - Editor ESP com 11 abas:
   - Identificação
   - Projetos (upload de arquivos)
   - Descrição e Aplicação
   - Execução
   - Fichas de Referência
   - Recebimento
   - Serviços Incluídos
   - Critérios de Medição
   - Legislação e Referências
   - Visualização de PDF
   - Exportar PDF

## Regras de Negócio (RBAC)

### ARQUITETO
- Cria e edita ESPs
- Upload de arquivos de projeto

### CHEFE_DE_NUCLEO e GERENTE
- Validam e acompanham ESPs
- Visualizam histórico de atividades

### DIRETOR
- Aprova ESPs
- Exporta documentos (PDF/DOCX)
- Acesso total ao sistema

## Credenciais de Teste (Seed Data)

```
Arquiteto:
  Email: arquiteto@seedf.df.gov.br
  Senha: Arquiteto123!

Chefe de Núcleo:
  Email: chefe@seedf.df.gov.br
  Senha: Chefe123!

Gerente:
  Email: gerente@seedf.df.gov.br
  Senha: Gerente123!

Diretor:
  Email: diretor@seedf.df.gov.br
  Senha: Diretor123!
```

## Próximos Passos (Backend - Task 2)

### Pendências
- [ ] Implementar endpoints da API
- [ ] Configurar Prisma com SQLite
- [ ] Configurar MongoDB GridFS para arquivos
- [ ] Implementar autenticação JWT
- [ ] Criar middleware RBAC
- [ ] Implementar geração de PDF (pdfkit)
- [ ] Implementar geração de DOCX (docx)
- [ ] Criar seed com usuários de teste
- [ ] Documentação Swagger (/api/docs)

## Estado Atual

### ✅ Completado (Fase 1 - Frontend)
- Schema de dados completo (shared/schema.ts)
- Cores institucionais configuradas (index.css, tailwind.config.ts)
- Todas as páginas públicas implementadas
- Todas as páginas privadas implementadas
- Componentes reutilizáveis criados
- Interface de storage definida
- Rotas configuradas
- Design guidelines documentado
- Acessibilidade WCAG AA

### 🔄 Em Progresso
- Task 2: Backend (API, autenticação, banco de dados)
- Task 3: Integração frontend-backend

## Tecnologias e Bibliotecas

### Frontend
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Wouter (routing)
- TanStack Query (data fetching)
- React Hook Form + Zod (forms & validation)
- Radix UI (primitives)
- Shadcn/ui (components)
- Lucide React (icons)
- Sonner (toasts)
- date-fns (date formatting)

### Backend (a implementar)
- Express
- TypeScript
- Prisma (ORM)
- SQLite (dev) / PostgreSQL (prod)
- MongoDB + GridFS
- JWT + bcrypt
- Zod (validation)
- Winston (logging)
- PDFKit (PDF generation)
- docx (DOCX generation)
- Swagger (API docs)

## Convenções de Código

### Naming
- Componentes: PascalCase
- Hooks: camelCase com prefixo 'use'
- Utilitários: camelCase
- Test IDs: kebab-case com prefixo (button-, input-, text-, etc.)

### Organização
- Um componente por arquivo
- Exportar como default para páginas
- Exportar como named export para componentes reutilizáveis
- Manter lógica de negócio separada de componentes UI

### Acessibilidade
- Todo elemento interativo tem data-testid
- Todos os formulários têm labels associados
- Navegação por teclado funcional
- ARIA labels em ícones e ações
- Estados de foco visíveis (outline amarelo)
