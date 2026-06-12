# 🐄 CriaViva

**Gestão reprodutiva bovina — nunca perca um parto.**

O CriaViva é um micro-SaaS para produtores de gado de corte e leite acompanharem o ciclo reprodutivo do rebanho: coberturas (IA/monta), diagnósticos de gestação, previsão de partos e — o coração do produto — **alertas push no celular nos dias que antecedem cada parto**.

🌐 **Acesse em produção: [criaviva.pecuariadesucesso.com](https://criaviva.pecuariadesucesso.com)**

---

## Por que existe?

Perder o momento do parto é um dos maiores causadores de mortalidade de bezerros e de complicações com a matriz. Em fazendas sem rotina rígida de controle, a data prevista de parto (DPP) fica num caderno ou numa planilha que ninguém abre. O CriaViva resolve isso com o mínimo de fricção:

1. Você registra a **IA ou monta** do animal.
2. O sistema calcula a **DPP** (cobertura + 283 dias) e abre uma gestação.
3. Você confirma com o **diagnóstico de gestação**.
4. O sistema dispara **notificações push** no seu celular aos **13, 7 e 3 dias antes do parto**, **no dia previsto** e **3 dias depois caso o parto não tenha sido registrado**.

## Funcionalidades

- 📋 Cadastro de fazendas, animais (brinco, raça, peso) e múltiplos usuários por fazenda com papéis (admin, editor, visualizador)
- 🔁 Linha do tempo reprodutiva por animal: cio, IA/monta, diagnóstico, parto, desmame, descarte
- 🤰 Gestões de gestação com máquina de estados (suspeita → confirmada → concluída/abortada)
- 🔔 Alertas pré-parto via Web Push (PWA — funciona como app no celular, sem loja de aplicativos)
- 📊 Dashboard com partos da semana/mês, vacas prenhes e vacas abertas
- 📈 Relatórios de eficiência reprodutiva (taxa de concepção, partos, vacas abertas há mais tempo)

---

## Arquitetura

Monorepo (Yarn/NPM Workspaces + Turborepo) com três pacotes:

```
cria-viva/
├── apps/
│   ├── api/        # NestJS 10 — API REST, jobs e push
│   └── web/        # React 18 + Vite — PWA
├── packages/
│   └── shared/     # Tipos e regras de domínio compartilhadas (DPP, urgência)
├── docker-compose.yml        # Ambiente de desenvolvimento completo
├── docker-compose.prod.yml   # Override para self-hosting
└── Procfile                  # Deploy no Heroku (um único dyno)
```

### Visão geral

```mermaid
flowchart LR
    subgraph Cliente
        PWA["📱 PWA React<br/>(Service Worker)"]
    end

    subgraph "Dyno único (Heroku) ou containers (Docker)"
        API["NestJS API<br/>/api/*"]
        STATIC["ServeStatic<br/>(SPA build)"]
        QUEUE["BullMQ<br/>worker"]
    end

    DB[("MariaDB<br/>(JawsDB)")]
    REDIS[("Redis<br/>(filas)")]
    PUSHSVC["Serviços Web Push<br/>(FCM / Mozilla)"]
    SCHED["Heroku Scheduler<br/>(diário 06:00 UTC)"]

    PWA -->|"REST + JWT"| API
    PWA -.->|"GET /"| STATIC
    API --> DB
    API -->|enfileira| REDIS
    QUEUE -->|consome| REDIS
    QUEUE -->|"web-push (VAPID)"| PUSHSVC
    PUSHSVC -->|notificação| PWA
    SCHED -->|"POST /api/alertas/processar<br/>(x-cron-secret)"| API
```

Em produção **um único processo** serve tudo: o NestJS expõe a API em `/api/*` e entrega o build do React para as demais rotas (via `@nestjs/serve-static`). Isso permite rodar no plano básico do Heroku com um só dyno.

### Modelo de dados

```mermaid
erDiagram
    USUARIO ||--o{ USUARIO_FAZENDA : "participa"
    FAZENDA ||--o{ USUARIO_FAZENDA : "tem membros"
    FAZENDA ||--o{ ANIMAL : "possui"
    ANIMAL ||--o{ EVENTO_REPRODUTIVO : "histórico"
    ANIMAL ||--o{ GESTACAO : "gestações"
    EVENTO_REPRODUTIVO |o--o| GESTACAO : "cobertura origina"
    GESTACAO ||--o{ ALERTA : "gera"
    FAZENDA ||--o{ ALERTA : "recebe"
    USUARIO ||--o{ PUSH_SUBSCRIPTION : "dispositivos"

    USUARIO_FAZENDA {
        enum papel "ADMIN | EDITOR | VISUALIZADOR"
    }
    ANIMAL {
        string brinco "único por fazenda"
        enum status "ATIVA | SECA | DESCARTADA | VENDIDA | MORTA"
    }
    GESTACAO {
        date dataCobertura
        date dpp "cobertura + 283 dias"
        enum status "SUSPEITA | CONFIRMADA | ABORTADA | CONCLUIDA"
    }
    ALERTA {
        enum tipo "PRE_PARTO_13D | 7D | 3D | DPP | POS_DPP_SEM_REGISTRO"
        enum status "PENDENTE | ENVIADO | FALHOU | CANCELADO"
    }
```

### Fluxo de um alerta de parto

```mermaid
sequenceDiagram
    participant S as Heroku Scheduler
    participant A as AlertasService
    participant Q as Fila BullMQ (Redis)
    participant P as AlertasProcessor
    participant W as web-push
    participant C as Celular do produtor

    S->>A: POST /api/alertas/processar (x-cron-secret)
    A->>A: busca gestações ativas e calcula dias até a DPP
    alt dias ∈ {13, 7, 3, 0, -3} e alerta ainda não enviado
        A->>Q: enfileira job "enviar-push"
        Q->>P: entrega o job
        P->>W: sendNotification para cada dispositivo da fazenda
        W->>C: 🔔 "Parto em 3 dias — Mimosa (001)"
        P->>P: marca alerta como ENVIADO
    end
```

### Eventos reprodutivos — máquina de estados

Cada tipo de evento tem um *handler* dedicado (`apps/api/src/modules/eventos/handlers/`) que valida o estado reprodutivo do animal antes de aplicar efeitos:

| Evento | Pré-condição | Efeito |
|---|---|---|
| `IA` / `MONTA` | sem gestação ativa | cria gestação `SUSPEITA` com DPP calculada |
| `DIAGNOSTICO_GESTACAO` (+) | gestação ativa | confirma a gestação |
| `DIAGNOSTICO_GESTACAO` (−) | gestação ativa | aborta e cancela alertas |
| `PARTO` | gestação ativa há ≥ 240 dias | conclui a gestação, registra data real |
| `CIO`, `DESMAME`, `DESCARTE` | — | registro no histórico |

Apagar um evento executa o `revert()` do handler — ex.: apagar uma IA remove a gestação e os alertas criados por ela.

---

## Stack

| Camada | Tecnologia |
|---|---|
| API | NestJS 10, Prisma 5, Passport-JWT, BullMQ, web-push |
| Banco | MariaDB / MySQL |
| Filas | Redis |
| Front | React 18, Vite, TypeScript, Tailwind CSS, React Query, Zustand |
| PWA | vite-plugin-pwa + Service Worker próprio para push |
| Build | Turborepo, Workspaces |
| Deploy | Heroku (buildpack Node.js) ou Docker Compose |

---

## Rodando localmente

### Pré-requisitos

- Docker + Docker Compose (caminho recomendado — não precisa de Node local)

### Subir tudo

```bash
git clone https://github.com/paulohrodrigues/cria-viva.git
cd cria-viva
docker compose up -d
```

| Serviço | URL |
|---|---|
| Web (React + hot reload) | http://localhost:3001 |
| API (NestJS + hot reload) | http://localhost:3002/api |
| MariaDB | localhost:3306 (`criaviva` / `criaviva123`) |

O compose já injeta todas as variáveis de desenvolvimento (incluindo chaves VAPID de teste). O schema do banco é aplicado automaticamente na subida do container da API.

### Testar os alertas sem esperar 283 dias

```bash
# 1. Crie conta, fazenda e animal pela interface (http://localhost:3001)
# 2. Registre uma IA e um diagnóstico positivo no animal
# 3. Ajuste a DPP para hoje direto no banco:
docker exec cria-viva-db mariadb -ucriaviva -pcriaviva123 criaviva_dev \
  -e "UPDATE gestacoes SET dpp = CURDATE() WHERE status = 'CONFIRMADA';"

# 4. Ative as notificações na página Configurações (o navegador pedirá permissão)
# 5. Dispare o processamento (mesma chamada que o cron faz em produção):
curl -X POST http://localhost:3002/api/alertas/processar \
  -H "x-cron-secret: criaviva-cron-dev-2026"
```

A notificação chega em segundos em todos os dispositivos inscritos.

### Variáveis de ambiente

Veja `apps/api/.env.example`. Resumo:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | `mysql://user:senha@host:3306/banco` |
| `JWT_SECRET` | ✅ | A API **não sobe** sem ela. Gere com `openssl rand -hex 32` |
| `REDIS_URL` ou `REDIS_HOST`/`REDIS_PORT` | ✅ | Conexão do BullMQ (URL tem precedência; `rediss://` ativa TLS) |
| `CRON_SECRET` | ✅ | Autoriza o `POST /api/alertas/processar` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | ✅ | Identidade Web Push. Gere com `npx web-push generate-vapid-keys` |
| `VAPID_EMAIL` | ✅ | Contato exigido pelo protocolo (`mailto:...`) |
| `FRONTEND_URL` | ✅ | Origem permitida no CORS |
| `PORT` | — | Definida pelo Heroku automaticamente |

---

## Deploy (Heroku)

1. Crie o app e conecte este repositório (Deploy → GitHub).
2. Buildpack: apenas `heroku/nodejs`.
3. Add-ons: **JawsDB Maria** (banco) e **Heroku Redis** (filas).
4. Config Vars: copie `JAWSDB_MARIA_URL` para `DATABASE_URL` e defina as demais variáveis da tabela acima.
5. Add-on **Heroku Scheduler** com um job diário:
   ```bash
   curl -s -X POST https://SEU_APP.herokuapp.com/api/alertas/processar -H "x-cron-secret: $CRON_SECRET"
   ```

O `heroku-postbuild` compila shared → web → api, e a fase `release` do Procfile aplica as migrations (`prisma migrate deploy`) antes de cada nova versão entrar no ar.

> **Migrando de um banco criado com `db push`?** Marque o baseline uma única vez:
> `heroku run "cd apps/api && npx prisma migrate resolve --applied 0_init" -a SEU_APP`

---

## Segurança

Decisões implementadas (detalhes em `apps/api/src/main.ts` e módulos):

- **JWT obrigatório**: sem `JWT_SECRET` a aplicação recusa subir — não existe segredo padrão.
- **Multi-tenant por fazenda**: toda query passa pelo `FarmAccessService`; escrita exige papel `ADMIN` ou `EDITOR`.
- **Rate limiting** (por IP real, com `trust proxy`): 100 req/min global, 10 logins/min, 5 cadastros/dia (não há verificação de email — o limite compensa).
- **Validação estrita**: `ValidationPipe` com whitelist + DTOs com limites de tamanho; payloads desconhecidos são rejeitados.
- **Headers**: helmet (HSTS, nosniff, frame-options). CSP desabilitado por servir o SPA do mesmo processo.
- **Erros opacos**: falhas do Prisma viram 404/409/400 sem vazar detalhes internos.
- **Cron protegido**: comparação timing-safe do `x-cron-secret`.
- **Trade-off conhecido**: o token JWT fica em `localStorage` (vulnerável a XSS; mitigado pela ausência de HTML injetável e pelo React escapar conteúdo por padrão). Migração para cookie `httpOnly` está no radar.

Encontrou uma vulnerabilidade? **Não abra issue pública** — escreva para [paulohr.abreu@gmail.com](mailto:paulohr.abreu@gmail.com).

---

## Contribuindo

Contribuições são muito bem-vindas!

1. Abra uma **issue** descrevendo o bug ou a proposta antes de codar — alinha expectativas e evita trabalho perdido.
2. Faça o fork e crie um branch: `git checkout -b feat/minha-feature`.
3. Suba o ambiente com `docker compose up -d` e desenvolva com hot-reload.
4. Siga os padrões do projeto:
   - Commits no formato [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`, `chore:`...), mensagem em português.
   - Domínio em português (fazenda, gestação, brinco) — é o vocabulário do usuário final.
   - Novos eventos reprodutivos = novo handler em `eventos/handlers/` implementando `EventHandler` (`validate` / `apply` / `revert`) e registro no `EventHandlerRegistry`.
   - Toda rota nova de dados deve passar pelo `FarmAccessService`.
5. Abra o Pull Request explicando **o que** e **por quê**.

### Onde ajuda é especialmente bem-vinda

- Testes automatizados (unit nos handlers de eventos e e2e da API)
- Verificação de email / recuperação de senha
- Modo offline do PWA (sincronização quando o sinal volta — realidade de fazenda)
- Convite de membros para a fazenda pela interface

---

## Licença

[Polyform Noncommercial 1.0.0](LICENSE) — você pode usar, estudar, modificar e distribuir o projeto **livremente para fins não comerciais**. Para uso comercial (revenda, SaaS pago, embarcar em produto), entre em contato: [paulohr.abreu@gmail.com](mailto:paulohr.abreu@gmail.com).
