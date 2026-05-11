# CourseSphere

CourseSphere é uma aplicação full stack para gestão colaborativa de cursos online, desenvolvida para o desafio técnico V-LAB. O projeto entrega backend e frontend no mesmo repositório, com autenticação, CRUD de cursos e aulas, regras de permissão, integração externa, testes, Docker e interface responsiva com tema claro/escuro.

## Stack

- Backend: Node.js, TypeScript, Express, JWT, bcrypt, Zod e persistência JSON encapsulada por repositórios
- Frontend: React, Vite, TypeScript, React Router e lucide-react
- Testes: Vitest e Supertest
- DevOps: Dockerfiles para backend/frontend e `docker-compose`

## Requisitos atendidos

- Registro de usuário com nome, email e senha
- Login/logout com token JWT
- Rotas protegidas para área autenticada
- CRUD de cursos
- Validação de curso: nome mínimo, datas obrigatórias e data final maior ou igual à inicial
- Associação de curso ao usuário criador
- Permissão: apenas o criador pode editar ou excluir seus cursos
- CRUD de aulas por curso
- Status de aula: `draft` e `published`
- Validação de URL de vídeo quando informada
- Permissão: apenas o criador do curso pode criar, editar ou excluir aulas do curso
- Listagem de cursos com busca por nome
- Filtro de aulas por status
- Consumo da RandomUser API para sugerir instrutor convidado
- Feedback de loading, erros de validação e estados vazios
- README com instruções de execução, usuário demo, fluxos de uso, origem dos dados/assets e endpoints principais

## UX/UI e produto

- Redesign visual customizado da tela de login, cadastro, dashboard, aulas, calendário, certificados, perfil, detalhe do curso e formulário de curso
- Tema claro e escuro com switch persistido em `localStorage`
- Sidebar com navegação, área de usuário e menu de logout
- Dropdown de usuário fecha ao clicar fora
- Dashboard com cards de métricas, busca, filtros visuais, cards de curso com status/progresso e paginação visual
- Página de aulas com métricas agregadas, busca por aula/curso, filtro por status e atalhos para vídeo ou curso
- Página de calendário com visão mensal dos períodos dos cursos e lista de próximos cursos
- Página de certificados com métricas, busca, filtro visual, lista paginada e critérios de emissão
- Página de perfil com dados da sessão autenticada, resumo de cursos/aulas e atividade recente
- Tela de detalhe do curso com dados do curso, instrutor convidado, aulas, criação/edição/exclusão de aulas e ações do curso
- Formulário de curso com seta de retorno para home, inputs iconizados, mensagens de ajuda e card lateral de dicas
- Layout responsivo para desktop, tablet e mobile
- Estados de erro e carregamento tratados na UI
- Uso consistente de ícones, espaçamentos, cards, feedback visual e hierarquia tipográfica

## Práticas técnicas

- Monorepo com separação clara entre `backend` e `frontend`
- Backend organizado por domínio: controllers, services, repositories e presenters
- Regras de negócio centralizadas nos services
- Validação de entrada com Zod
- Tratamento de erro padronizado em JSON
- Senhas com hash usando bcrypt
- Autenticação stateless com JWT
- Persistência isolada atrás de `JsonDatabase`, facilitando troca futura para PostgreSQL/Prisma
- Frontend com cliente HTTP centralizado
- Estado de autenticação isolado em contexto React
- Rotas protegidas no frontend
- CSS dividido por domínio em `frontend/src/styles/sections`, com `main.css` apenas orquestrando os imports
- TypeScript estrito e typecheck nos dois projetos
- Testes automatizados de API e teste unitário no frontend

## Rodando localmente

Requisitos: Node.js 24+ e npm 11+

Na raiz do projeto:

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run seed --workspace backend
npm run dev
```

Atalhos equivalentes pelo Makefile:

```bash
make dev
```

Para rodar separadamente:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`
- Healthcheck: `http://localhost:3333/health`

Usuário criado pelo seed:

- Email: `demo@coursesphere.dev`
- Senha: `Password123`

Também é possível criar usuários pela tela de cadastro.

## Fluxo de uso

1. Acesse `http://localhost:5173/login`
2. Entre com o usuário demo ou crie uma conta em `/register`
3. Após o login, a sessão JWT é salva no `localStorage` e a aplicação abre a área protegida
4. Use o menu lateral para navegar entre Cursos, Aulas, Calendário, Certificados e Perfil
5. Em Cursos, crie um curso em “Novo curso”, edite ou exclua cursos próprios e abra um curso para gerenciar aulas
6. Em Aulas, veja uma biblioteca agregada de aulas de todos os cursos, filtre por `draft` ou `published` e abra o curso relacionado
7. Em Calendário, acompanhe as datas de início/fim dos cursos cadastrados
8. Em Certificados, acompanhe certificados considerados emitidos quando a data final do curso já passou
9. Em Perfil, veja os dados da sessão autenticada e métricas derivadas dos cursos e aulas

## Origem dos dados e imagens

- Usuários, cursos e aulas são persistidos pelo backend em JSON através de repositórios e services
- O usuário demo e dados iniciais são criados por `npm run seed --workspace backend`
- O curso inicial `Introdução ao Full Stack` nasce no arquivo `backend/src/seed.ts`; depois de seedado, ele fica gravado no arquivo JSON configurado por `DATA_FILE` (`backend/.data/coursesphere.json` no ambiente local padrão)
- Métricas do dashboard, aulas, certificados e perfil são calculadas no frontend a partir das respostas de `/api/courses` e `/api/courses/:courseId/lessons`
- Certificados são uma visualização de produto: a emissão é inferida quando `course.endDate` é menor ou igual à data atual; não há arquivo PDF real gerado nesta versão
- O instrutor convidado da tela de detalhe do curso vem da RandomUser API. Se a chamada falhar, a UI usa fallback local
- Logos e fundo estão em `frontend/public/images`: `cs-logo-original.png`, `cs-logo-simplificada.png` e `cs-bg.png`
- O favicon usa `cs-logo-simplificada.png`
- O tema claro/escuro é uma preferência local salva em `localStorage` na chave `coursesphere.theme`

## Rodando com Docker

```bash
docker compose up --build
```

Depois acesse `http://localhost:5173`

Para criar dados de exemplo no container:

```bash
docker compose exec backend npm run seed
```

## Deploy em produção

O deploy atual foi feito com backend e frontend separados:

- Backend no Render: `https://coursesphere-wel6.onrender.com`
- Healthcheck do backend: `https://coursesphere-wel6.onrender.com/health`
- API base: `https://coursesphere-wel6.onrender.com/api`
- Frontend na Vercel: `https://coursesphere-mocha.vercel.app`
- URL alternativa de deployment da Vercel: `https://coursesphere-c2nea31f0-mldm-projects.vercel.app`

### Backend no Render

O backend foi publicado como Web Service no Render apontando para a pasta `backend` do monorepo

Configurações usadas:

- Root Directory: `backend`
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm start`
- Node.js: `24.x`
- Instance Type: Free

Variáveis de ambiente usadas no Render:

- `NODE_ENV=production`
- `PORT=3333`
- `JWT_SECRET=<string longa e secreta configurada no painel do Render>`
- `JWT_EXPIRES_IN=7d`
- `DATA_FILE=.data/coursesphere.json`
- `FRONTEND_ORIGIN=https://coursesphere-mocha.vercel.app,https://coursesphere-c2nea31f0-mldm-projects.vercel.app,http://localhost:5173`

O build command usa `--include=dev` porque o backend compila TypeScript no deploy e precisa de dependências de desenvolvimento como `typescript` e pacotes `@types/*`

O CORS foi configurado para aceitar múltiplas origens separadas por vírgula em `FRONTEND_ORIGIN`, permitindo o domínio principal da Vercel, a URL alternativa de deployment e o ambiente local

### Frontend na Vercel

O frontend foi publicado na Vercel apontando para a pasta `frontend` do monorepo

Configurações usadas:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js: `24.x`

Variável de ambiente usada na Vercel:

- `VITE_API_URL=https://coursesphere-wel6.onrender.com/api`

O arquivo `frontend/vercel.json` foi incluído para redirecionar todas as rotas para `index.html`, permitindo que rotas do React Router como `/login`, `/register`, `/courses/:id` e `/profile` funcionem ao acessar diretamente ou atualizar a página

### Usuários em produção

Em produção, o usuário pode ser criado pela própria tela de cadastro em:

- `https://coursesphere-mocha.vercel.app/register`

Também é possível criar usuário diretamente pela API:

```bash
curl -X POST https://coursesphere-wel6.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@coursesphere.dev","password":"Password123"}'
```

Depois do cadastro, o login pode ser feito em:

- `https://coursesphere-mocha.vercel.app/login`

### Atenção sobre persistência no Render

Hoje o backend usa JSON local como persistência. Isso atende ao desafio e simplifica a execução, mas em instâncias gratuitas do Render o filesystem pode ser efêmero em redeploys/restarts. Para uma produção real, o próximo passo recomendado seria trocar `JsonDatabase` por PostgreSQL ou Prisma/Postgres

## Scripts

```bash
npm run dev      # backend e frontend em modo desenvolvimento
npm run build    # compila backend e frontend
npm run test     # testes automatizados
npm run lint     # typecheck dos dois projetos
make fullstack   # sobe backend e frontend juntos usando o script raiz
```

## API

Todas as rotas protegidas usam header:

```http
Authorization: Bearer <token>
```

Principais endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/courses?search=react`
- `POST /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/courses/:courseId/lessons?status=published`
- `POST /api/courses/:courseId/lessons`
- `PUT /api/lessons/:id`
- `DELETE /api/lessons/:id`

## Observações

A stack sugerida no briefing era Rails + React, mas o briefing permite outras tecnologias web. Para entregar uma solução executável, testável e bem organizada neste ambiente, o backend foi implementado com Node.js, TypeScript e Express, mantendo arquitetura em camadas, validações, autenticação e separação de responsabilidades.

Em produção, backend e frontend podem ser publicados separadamente usando os Dockerfiles inclusos.
