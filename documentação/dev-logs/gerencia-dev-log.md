## Diário de Gerência — Linha do Tempo

### Semana de 24/08/2025
- Kickoff do projeto; definição de stack (Node/React/Postgres/Mongo) e metas iniciais.
- Criação da estrutura de rotas base e autenticação.

### Semana de 31/08/2025
- Estabelecimento de perfis e RBAC (Arquiteto, Chefe de Núcleo, Gerente, Diretor).
- Dashboards iniciais e rotas públicas prontas.

### Semana de 07/09/2025
- Início da criação de itens de especificação para alimentar os cadernos.
- Catálogo de categorias/subcategorias mapeado.

### Semana de 14/09/2025
- Editor de ESP com abas principais funcionando.
- Validações e feedbacks de erro/aviso implementados.

### Semana de 21/09/2025
- Rotas de export (PDF/DOCX) iniciais para ESP.
- Acesso controlado por perfil revisado.

### Semana de 28/09/2025
- Dashboard com filtros conectados; UX de loading/empty states.
- Planejamento de uploads de mídia.

### Semana de 05/10/2025
- Infra de upload (Mongo/GridFS) em produção interna.
- Upload e gestão de arquivos ligados às ESPs.

### Semana de 12/10/2025
- Exportação aprimorada: imagens inseridas após identificação no PDF.
- Refinos de UX nas páginas de itens/landing/login.

### Semana de 19/10/2025
- Ajustes de acessibilidade e mensagens.
- Logo clicável para facilitar retorno ao dashboard.

### Semana de 26/10/2025
- Suporte a multi-cadernos em ESP; UX de seleção em “Nova ESP”.
- Dashboard refinado (cards, filtros e CTAs).

### Semana de 02/11/2025
- Separação de buckets de arquivos e endurecimento do upload.
- Bloqueios claros para registros novos (antes de export/upload).

### Semana de 09/11/2025
- Limpeza de seeds dummy; operação com dados reais.
- Polimento visual e consistência de cores/hover.

### Semana de 16/11/2025
- Datas e calendário pt-BR, toasts mais objetivos.
- Performance de abas melhorada (spinners localizados).

### Semana de 23/11/2025
- Botões de export direto no dashboard para cadernos/ESPs.
- Navegação via logo GDF unificada.

### Semana de 30/11/2025
- Upload em modo caderno corrigido (usa `cadernoId`); export de caderno habilitada.
- Nova ESP com seleção de cadernos e botões de export presentes.

### Semana de 07/12/2025
- Cadernos passam a salvar campos completos (textos + listas) e reidratar no editor.
- Export (caderno/ESP) resolve listas direto de `itens_especificacao`, aparecendo no PDF.
- Estado final estável para merge na main; próxima etapa: polir DOCX (futuro).
