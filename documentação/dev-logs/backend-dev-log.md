## Diário de Desenvolvimento — Backend

### Semana de 24/08/2025
- Sobe esqueleto do Express, autenticação JWT básica e seeds iniciais de usuários.
- Configura Drizzle + Postgres e define modelos principais: users, cadernos, esps.
- Roteiro mínimo: login, CRUD de cadernos/ESPs e healthcheck.

### Semana de 31/08/2025
- Implementa RBAC inicial (perfis Arquiteto, Chefe de Núcleo, Gerente, Diretor).
- Adiciona filtros de listagem (autor, status) nos endpoints de cadernos/ESPs.
- Ajusta seed para perfis e validações de payload com Zod.

### Semana de 07/09/2025
- Integração de itens de especificação: catálogo via `/api/catalog/*` consumindo `itens_especificacao`.
- Endpoints para criação de itens (criação-itens) e consumo nas listas de ESP/Caderno.
- Começa a preparar exportação (stub de PDF/DOCX com pdfkit/docx).

### Semana de 14/09/2025
- Melhora de logging (logs_atividade) e middleware de validação.
- Refina seeds de catálogo (constituintes, acessórios, acabamentos, aplicações).
- Ajusta busca de ESP com filtros (search, data, autor, status).

### Semana de 21/09/2025
- Endpoint de exportação PDF/DOCX das ESPs com dados básicos de identificação.
- Reforça validação de `cadernoId` ao criar ESP.
- Pequenos fixes de erros 404/401 e mensagens.

### Semana de 28/09/2025
- Otimiza consultas de listagem juntando autor e arquivos na resposta de ESP.
- Ajusta status de caderno para refletir permissões de mudança (RBAC).
- Prepara terreno para uploads (definição de TipoArquivo).

### Semana de 05/10/2025
- Introduz GridFS no Mongo para armazenar arquivos de mídia.
- Cria rota `/api/files/upload` (aceita imagens/PDF/DOCX) vinculando a ESP.
- Adiciona downloads e streaming de arquivos.

### Semana de 12/10/2025
- Ajusta exportação PDF para inserir imagens após a identificação.
- Melhora seeds de catálogos e corrige enum de subcategorias.
- Validações extras em upload (tamanho, mimetypes).

### Semana de 19/10/2025
- Refina rotas de export DOCX com conteúdo básico.
- Tratamento de erros padronizado em export e upload.
- Log detalhado de ações (UPLOAD_ARQUIVO, EXPORTAR_PDF/DOCX).

### Semana de 26/10/2025
- Ajusta storage para aceitar `cadernosIds` em ESP (multi-capítulos).
- Otimiza consultas com Drizzle (reduz roundtrips em autor/caderno).
- Pequenos ajustes de CORS e cookies.

### Semana de 02/11/2025
- Cria buckets separados (imagens/docs) no Mongo para organização.
- Harden de autenticação no upload (requireRole).
- Melhora mensagens de erro de validação.

### Semana de 09/11/2025
- Refatora seeds para remover demos antigas e deixar apenas usuários/catalogo.
- Ajusta RBAC para refletir poderes de exclusão/status.
- Sanitiza respostas de arquivos (não retorna `fileData` em listagem).

### Semana de 16/11/2025
- Corrige export de ESP para lidar com datas/locale PT-BR.
- Limpa warnings em pdfkit/docx de codificação.
- Melhora queries de filtros (status/data) nas ESPs.

### Semana de 23/11/2025
- Integra upload com export: imagens armazenadas em GridFS são embutidas no PDF.
- Ajusta rota de arquivos para aceitar buckets diferentes e logs.
- Corrige erro de autenticação no upload (SCRAM).

### Semana de 30/11/2025
- Reestrutura arquivos para suportar `cadernoId` além de `espId` (upload/listagem/download/delete).
- Export de caderno: adiciona rotas `/api/export/pdf-caderno` e `/api/export/docx-caderno`.
- Cria geradores `generateCadernoPdf`/`generateCadernoDocx`.

### Semana de 07/12/2025
- Amplia schema de `cadernos` com os mesmos campos de conteúdo da ESP (textos + arrays de IDs).
- Salva todos os campos no caderno (descrição/aplicação, execução, fichas, recebimento, serviços, critérios, legislação, referências).
- Export de caderno/ESP agora resolve IDs direto de `itens_especificacao` ativo, exibindo bullets das listas no PDF.
- Correções finais: uploads em caderno (usa `cadernoId`), export disabled apenas para registros não salvos, botões de export no dashboard.
