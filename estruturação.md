# Sistema de Automação ESP - SEEDF

## Visão Geral

Este projeto é um sistema de automação para o **Caderno de Especificações (ESP)** da **Secretaria de Estado de Educação do Distrito Federal (SEEDF)**.  
Trata-se de um aplicativo **institucional governamental**, desenvolvido com foco na **identidade visual oficial** e na **conformidade com as diretrizes de acessibilidade WCAG AA**.  

O sistema tem como objetivo **otimizar a criação, gestão, validação e aprovação** dos ESPs, atendendo a diferentes perfis de usuários dentro da SEEDF.  
Entre suas principais funcionalidades estão:  
- Editor completo de ESP (com múltiplas seções)  
- Gerenciamento de documentos (upload, download, streaming)  
- Exportação robusta para **PDF** e **DOCX**

---

## Preferências do Usuário

- Explicações em **linguagem simples**  
- Desenvolvimento **iterativo** (recursos construídos passo a passo)  
- **Confirmar antes** de realizar grandes alterações na arquitetura ou adicionar novas dependências

---

## Arquitetura do Sistema

A aplicação segue uma arquitetura **cliente-servidor**.

### Decisões de UI/UX

O design segue rigorosamente a **identidade visual oficial da SEEDF**, utilizando um esquema tricolor (azul institucional, amarelo e branco) para manter a padronização e a acessibilidade.

- **Cores oficiais:**  
  - Azul Institucional: `#0361ad`  
  - Amarelo Institucional: `#fae947`  
  - Branco: `#ffffff`  
  - Preto: `#000000`  

- **Acessibilidade:**  
  Compatível com **WCAG AA**, com alto contraste, navegação completa por teclado, rótulos ARIA e foco visível com contorno amarelo  

- **Biblioteca de componentes:**  
  Utiliza **Shadcn/UI** e **Radix UI** para construção de componentes acessíveis e personalizáveis

---

### Implementações Técnicas

**Frontend:**  
- Desenvolvido com **React**, **TypeScript**, **Vite**, **Tailwind CSS** e **Wouter** para uma experiência de **SPA (Single Page Application)**  
- **TanStack Query** usado para busca de dados  
- **React Hook Form** com **Zod** para validação de formulários

**Backend:**  
- Construído com **Express** e **TypeScript**  
- **Drizzle ORM** faz a interface com o banco de dados **PostgreSQL**  
- **Autenticação:** via tokens **JWT** armazenados no `localStorage`  
- **Validação:** **Zod** utilizado no frontend e backend

**Modelos de Dados:**  
- **User (Usuário):** Gerencia perfis como ARQUITETO, CHEFE_DE_NUCLEO, GERENTE e DIRETOR, com **controle de acesso baseado em papéis (RBAC)**  
- **Caderno:** Representa cadernos de especificações com status `OBSOLETO`, `EM_ANDAMENTO` e `APROVADO`  
- **ESP (Especificação):**  
  - Entidade principal com campos de conteúdo, status e arquivos associados  
  - Suporte a múltiplos cadernos via `cadernosIds` (array de texto), mantendo compatibilidade com o campo legado `cadernoId`  
  - Campos adicionais: `introduzirComponente` (texto) e arrays de IDs de catálogo  
- **ArquivoMidia:** Armazena metadados de arquivos  
- **LogAtividade:** Registra todas as ações dos usuários  
- **ItensEspecificacao:** Tabela unificada que gerencia todas as opções do editor ESP, categorizadas por `CategoriaItem` e `SubcategoriaItem`

**Armazenamento de Arquivos:**  
- Arquivos salvos como strings **base64** no **PostgreSQL**  
- Uploads processados com **Multer**

**Exportação de Documentos:**  
- **PDFKit** para geração de PDFs  
- **docx** para geração de arquivos Word  
- Ambos seguem o formato **institucional da SEEDF**

**Autenticação:**  
- Tokens **JWT** armazenados no `localStorage` e enviados via cabeçalho `Authorization: Bearer`

---

## Especificações de Funcionalidades

- **Editor de ESP:**  
  Interface com 11 abas, permitindo edição detalhada e integração dinâmica com o catálogo `ItensEspecificacao`

- **Nova ESP:**  
  - Página `/nova-esp` para criação de ESPs vinculadas a múltiplos cadernos  
  - Seleção múltipla via checkboxes, validação com **Zod** e redirecionamento automático após criação  
  - Implementa o endpoint **POST `/api/esp/nova`** com validação e registro de logs  

- **Criação de Itens:**  
  Página independente para criação e gerenciamento de **ItensEspecificacao** que alimentam o catálogo do editor  

- **Dashboard:**  
  Permite filtragem e busca de ESPs  
  Inclui o botão “Nova ESP”, que leva à página de criação multi-caderno  

- **Controle de Acesso por Funções (RBAC):**  
  - **ARQUITETO:** Criar e editar  
  - **CHEFE_DE_NUCLEO / GERENTE:** Validar e monitorar  
  - **DIRETOR:** Aprovar, exportar DOCX e acesso total  

- **Sistema de Catálogo Unificado:**  
  A tabela `itens_especificacao` é a **fonte única de verdade** para os dados do catálogo, garantindo consistência e integração automática de novos itens no editor ESP

---

## Alterações Recentes (28 de outubro de 2025)

- **Suporte a Multi-Caderno:** Adicionado o campo `cadernosIds` (array de texto) ao esquema de ESP, permitindo vincular múltiplos cadernos a uma única ESP, mantendo compatibilidade com `cadernoId`  
- **Página “Nova ESP”:** Criada nova rota `/nova-esp` com interface de seleção múltipla via checkboxes, seguindo o design institucional  
- **Aprimoramento de API:** Implementado o endpoint **POST `/api/esp/nova`** com validação via **Zod**, verificação de cadernos e registro de logs  
- **Atualizações de Armazenamento:** Métodos `createEsp` e `updateEsp` ajustados para lidar com o campo `cadernosIds`  
- **Correção de Navegação:** Corrigido o parsing de JSON no frontend para navegação correta após criação da ESP  
- **Testes:** Teste E2E validando o fluxo completo: login → Nova ESP → seleção de cadernos → criação de ESP → editor

---

## Dependências Externas

- **PostgreSQL (via Neon):** Banco de dados relacional principal  
- **JWT (JSON Web Tokens):** Autenticação segura de usuários  
- **bcrypt:** Hashing de senhas  
- **PDFKit:** Geração de documentos PDF  
- **docx:** Geração de documentos Microsoft Word (DOCX)  
- **Winston:** Biblioteca de logs do backend  
- **Multer:** Middleware para upload de arquivos  
- **Lucide React:** Biblioteca de ícones para o frontend  
- **Sonner:** Biblioteca de notificações (toasts)  
- **date-fns:** Biblioteca utilitária para manipulação de datas
