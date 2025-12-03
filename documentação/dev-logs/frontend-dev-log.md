## Diário de Desenvolvimento — Frontend

### Semana de 24/08/2025
- Sobe Vite + React + Tailwind base.
- Cria rotas públicas (landing, login, register) e shell do app.
- Configura wouter e tema inicial institucional.

### Semana de 31/08/2025
- Implementa layout do dashboard e cards de listagem de cadernos/ESPs.
- Formulário de login/registro integrado ao backend.
- Primeiros componentes compartilhados (botões institucionais, header).

### Semana de 07/09/2025
- Tela de criação de itens (rich text simples, seleção de categoria/subcategoria).
- Consumo dos catálogos vindos do backend nas listas.
- Ajuste de tipografia e cores para identidade SEEDF.

### Semana de 14/09/2025
- Sidebar de abas no editor de ESP (identificação, descrição/aplicação, etc.).
- Validações básicas de campos obrigatórios e feedback via toast.
- Ajustes de responsividade e foco de acessibilidade.

### Semana de 21/09/2025
- Botões de ação por aba (Salvar/Atualizar/Abrir PDF).
- Navegação por abas atualiza URL (wouter).
- Melhorias no upload (dropzone simples) e mensagens de erro.

### Semana de 28/09/2025
- Estado global de usuário (auth) lido do localStorage.
- Filtros no dashboard (search, data, autor, status) conectados.
- Indicadores de loading e empty states.

### Semana de 05/10/2025
- Integração com upload de arquivos para ESP (imagens/PDF/DOCX).
- Pré-visualização de arquivos enviados (lista com download/delete).
- Ajuste de botões para padrão institucional (azul/outline).

### Semana de 12/10/2025
- Inserção de imagens após identificação no PDF (coordenação com backend).
- Melhorias de UX na criação de itens (toolbar de lista/bold/itálico).
- Correção de hover e espaçamentos nos CTAs da landing/login.

### Semana de 19/10/2025
- Ajustes de acessibilidade: labels, aria, foco em inputs e tabs.
- Feedback de erros de export e upload mais claro.
- Ajusta header público para navegar ao dashboard (logo clicável).

### Semana de 26/10/2025
- Integração de multi-cadernos em ESP: seleção dinâmica na tela de nova ESP.
- Refinamento do layout do dashboard (cards mais limpos, filtros compactos).
- Botões de export no dashboard para cada item.

### Semana de 02/11/2025
- Atualiza componentes de upload para lidar com GridFS (sem mudanças visuais).
- Adiciona mensagens de alerta quando registro é novo (bloqueia upload/export).
- Melhora estados desabilitados de botões.

### Semana de 09/11/2025
- Ajustes de seed visual removidos; UI usa dados reais do backend.
- Pequenas correções de alinhamento nos cards e filtros.
- Normaliza cores/hover de “Entrar” e links de registrar.

### Semana de 16/11/2025
- Polimento de tooltips e toasts; mensagens mais objetivas.
- Campos de data com calendário pt-BR, placeholders alinhados.
- Melhora o carregamento de abas (spinners por aba).

### Semana de 23/11/2025
- Dashboard: botões “Exportar PDF” para cadernos/ESPs direto da lista.
- Ajuste do header (logo GDF clicável para dashboard).
- Espaçamento e contraste em seções principais.

### Semana de 30/11/2025
- Upload em modo caderno envia `cadernoId` (não quebra mais em 404).
- Export em modo caderno usa endpoints específicos; botões reabilitados.
- Nova UX de nova ESP: seleção de cadernos em lista com “Adicionar”.

### Semana de 07/12/2025
- Editor em modo caderno salva todos os campos (textos + listas) e reidrata ao abrir.
- Listas do PDF agora aparecem (lookup de IDs direto de `itens_especificacao`).
- Correções finais de navegação `/caderno/novo`, contadores de listas e estados desabilitados de export/upload.
