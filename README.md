# Big Chat Brasil (BCB)

## Sobre

API de chat entre empresas e clientes finais, com cobrança por mensagem (pré-pago e pós-pago) e fila de processamento.

**Perfil:** Backend
**Escopo:** Parte 1, com fila FIFO em memória e processamento dentro
da requisição HTTP.

A entrega implementa gerenciamento de clientes, conversas, envio simulado,
validação financeira e histórico de mensagens. Também inclui identificação
por header, suporte aos dois planos, documentação Swagger e teste unitários.

## Premissas

- Autenticação só identifica o cliente. Não há senha nem JWT. O `POST /auth` devolve dados do cliente; as próximas requisições precisam receber o documento no header para identificação do cliente.
- `POST /clients` é público: cadastro não exige token nem header de admin.
- O envio de mensagem é **simulado** (log no servidor). Não há integração real com SMS ou WhatsApp.
- A fila vive em memória no processo da API. Reiniciar o container esvazia a fila.
- Mensagens urgentes têm custo maior, mas a fila processa em ordem FIFO (sem priorizar).

## Tecnologias

- **Node.js** e **TypeScript**
- **Fastify** (HTTP) e **Zod** (validação)
- **Prisma** e **PostgreSQL**
- **Docker Compose**
- **Swagger / OpenAPI** em `/docs` (`@fastify/swagger` + `@fastify/swagger-ui`)

## Como executar

Requisitos: Node.js (20.19+, 22.12+, 24.0+), npm, e Docker

O Compose sobe só o Postgres. A API roda na máquina, com `npm run dev`. Executar os comandos abaixo em ordem:

```bash
git clone https://github.com/gustavosalviato/bcb.git
cd bcb
cp .env.example .env
npm i
docker compose up -d
npx prisma migrate dev --config prisma7.config.ts
npm run db:seed
npm run dev
```

`npm run db:seed` grava clientes, conversas e mensagens de exemplo. Rodar de novo apaga e recria só esses documentos, sem mexer em outros cadastros.

Serviços:

- **Postgres** na porta `5432` (usuário `docker`, senha `docker`, banco `bcb`)
- **API** em `http://localhost:3333`

Documentação interativa: [http://localhost:3333/docs](http://localhost:3333/docs)

Variáveis em `.env.example`: `PORT`, `DATABASE_URL`, `ADMIN_API_KEY`. A chave de admin padrão é `admin-api-key` (altere se for expor o ambiente).

O Prisma usa o arquivo `prisma7.config.ts`. Sem `--config`, o CLI não encontra a URL do banco.

Testes unitários (in-memory):

```bash
npm run test
```

## Dados de exemplo

Depois do seed, estes documentos já existem:

| Cliente | Documento | Plano | O que tem |
| --- | --- | --- | --- |
| Empresa ABC | `12345678000199` | pré-pago | saldo R$ 1,25, duas conversas, mensagens `sent` e `failed` |
| Loja Norte | `98765432000188` | pós-pago | limite R$ 2,75, uma conversa, mensagens `sent` |
| Cliente Inativo | `12345678909` | pré-pago | `active: false`, sem conversas |

Header do cliente de exemplo: `x-client-document-id: 12345678000199`.

## Como autenticar

**Cadastro (público)**

```http
POST /clients
Content-Type: application/json

{
  "name": "Empresa ABC",
  "documentId": "77777777777777",
  "documentType": "CNPJ",
  "planType": "prepaid"
}
```

**Identificação do cliente**

```http
POST /auth
Content-Type: application/json

{
  "documentId": "77777777777777"
}
```

Nas rotas do cliente, envie o mesmo documento:

```http
x-client-document-id: 77777777777777
```

**Admin**

Nas rotas administrativas:

```http
x-admin-key: admin-api-key
```

O header de admin **não** autentica o cliente, e o header de cliente **não** libera rotas de admin.

## Decisões técnicas

1. **Fastify + TypeScript.** Stack do dia a dia. Familiaridade reduz o tempo de setup e deixa o foco no desafio da fila.

2. **PostgreSQL + Prisma.** Conjunto já usado em projetos de estudo.

3. **Camadas HTTP / caso de uso / repositório.** Estrutura simples, com papel claro: HTTP, regra de negócio e persistência.

4. **Auth mínima.** `POST /auth` identifica o cliente por CPF/CNPJ.

5. **Dois headers.** `x-admin-key` só em recursos de admin. Cliente autenticado usa `x-client-document-id`. Escopos separados de propósito.

6. **`POST /clients` público.** Cadastro exige só dados de registro (`documentId`, `planType`, `documentType`, etc.). Sem token ou header.

7. **Acesso aos clientes.** As consultas administrativas utilizam
`/clients/:clientId`. As rotas `/clients/profile` e `/clients/balance`
utilizam o cliente identificado pelo header. Conversas e mensagens são acessíveis apenas pelo cliente proprietário.

8. **Fila FIFO em memória (`Map` com ponteiros).** Forma mais simples encontrada para enfileirar e processar na mesma requisição até `sent` ou `failed`.

9. **Cadeia de `Promise`.** Serializa o processamento no processo (uma mensagem por vez).

10. **Sender simulado.** O teste aceita simular o envio.

11. **Cobrança em transação Prisma `Serializable`.** Débito ou consumo de limite, criação da mensagem e registro financeiro entram juntos: commit se tudo der certo; exceção se alguma ação falhar, sem persistir o conjunto.

12. **Prioridade só no custo.** `normal` custa R$ 0,25 e `urgent` R$ 0,50, mas a fila não reordena.

13. **Swagger em `/docs`.** Documentar os endpoints para o avaliador.

14. **Testes:** Testes unitários para os casos de uso.

15. **Créditos e inativação só para admin.** `POST /clients/:clientId/credits` adiciona saldo (pré-pago) ou limite (pós-pago). O cliente não se credita. `DELETE /clients/:clientId` é **soft delete** (`active: false`), também restrito a admin.

### Regras financeiras

- Valores são armazenados em reais com `Decimal`
- O custo é calculado no servidor: R$ 0,25 para mensagens normais
  e R$ 0,50 para urgentes.
- No pré-pago, o envio exige saldo suficiente e debita o custo.
- No pós-pago, o limite contratado é comparado ao consumo de mensagens
  do mês, considerando o horário de Brasília.
- Aumentar o limite não quita nem zera o consumo mensal.
- A cobrança e a criação da mensagem ocorrem na mesma transação.
- Falhas no envio simulado não geram estorno automático.

## Funcionalidades implementadas

Alinhado às entregas mínimas da Parte 1 (auth e clientes, fila em memória, validação financeira, histórico de conversas, envio e processamento e recebimento):

- `POST /auth` — identifica o cliente pelo documento
- CRUD de clientes: `POST /clients` (público), `GET /clients` e `GET /clients/:clientId` (admin), `PUT /clients/profile` (cliente)
- `GET /clients/balance` — saldo (pré-pago) ou limite (pós-pago) do cliente autenticado
- Conversas: `POST /conversations`, `GET /conversations`, `GET /conversations/:conversationId`
- Mensagens: `POST /messages` (valida plano, cobra, enfileira e processa na mesma request), `GET /conversations/:conversationId/messages`, `GET /conversations/:conversationId/messages/:messageId`
- Fila FIFO em memória e status `queued` → `processing` → `sent` ou `failed`
- Planos **pré-pago** e **pós-pago**

Extras:

- `POST /clients/:clientId/credits` (admin)
- `DELETE /clients/:clientId` — inativa o cliente (admin)
- Swagger em `/docs`

Contratos de request/response: Swagger em `/docs`.

## Melhorias futuras

**Parte 2**

- Fila com dois níveis (urgente primeiro) e proteção contra starvation
- Status `delivered` e `read` no fluxo
- Autenticação mais completa (token/JWT)
- Conversão de plano e listagem de histórico financeiro
- Consulta de pós-pago com consumo do mês

**Parte 3**

- Worker assíncrono fora da requisição HTTP
- `GET /queue/status` e métricas da fila
- Cache, retry e simulação de tempo real
