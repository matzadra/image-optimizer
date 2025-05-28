# NOVA FEATURE: Filtragem de Assets Otimizados por Cliente
## Validação de assets otimizados (whitelist por client)

A aplicação utiliza uma validação explícita para garantir que **somente assets otimizados sejam carregados**.

Essa lógica é baseada na collection `optimized_assets`, que funciona como uma **whitelist indexada por `clientId` + `taskId`**.  
Isso permite que múltiplos clientes tenham suas próprias listas de assets permitidos.

---
A rota `/assets` retorna apenas imagens otimizadas com `status: "done"` e `taskId` autorizado por cliente, via whitelist (`OptimizedAssetModel`).

---

### 🔍 Rota

GET /assets?clientId=trakto&limit=50&offset=0

Parâmetros:

| Param    | Tipo   | Default | Descrição                              |
| -------- | ------ | ------- | -------------------------------------- |
| clientId | string | —       | Identificador do cliente (obrigatório) |
| limit    | int    | 50      | Quantidade de resultados retornados    |
| offset   | int    | 0       | Deslocamento inicial da consulta       |

---

### Exemplo de requisição

```bash
curl "http://localhost:3000/assets?clientId=trakto&limit=50&offset=0"
````

---

### Exemplo de resposta

```json
{
  "total": 2800,
  "count": 50,
  "offset": 0,
  "limit": 50,
  "data": [
    {
      "taskId": "task-1",
      "displayId": "D-1",
      "originalFilename": "img-1.jpg",
      "status": "done",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

---

### Seed Automático (na inicialização da API)

Executado via script `run-seed.sh`, controlado por variáveis no `docker-compose.yml`:

| Variável        | Descrição                             | Padrão |
| --------------- | ------------------------------------- | ------ |
| SEED\_TOTAL     | Quantidade total de ImageTasks        | 5000   |
| SEED\_WHITELIST | Quantas entram na whitelist           | 1500   |
| SEED\_EXCLUSIVE | Destas, quantas são do tipo exclusive | 400    |

No Dockerfile:

CMD \["./wait-for.sh", "mongo:27017", "--", "sh", "-c", "./run-seed.sh && node dist/apps/api/src/main.js"]

---

### Conclusão Técnica

* Filtragem real por `status: "done"` + whitelist por cliente
* Paginação feita diretamente no banco com `.skip().limit()`
* Índice composto `{ clientId, taskId }` garante performance
* Rota pública e desacoplada da lógica de processamento
* Seed configurável e executado automaticamente na API
* Estrutura pronta para cache se necessário (ex: Redis)
---

# Image Optimizer

Serviço backend para otimização de imagens, geração de múltiplas versões e gerenciamento assíncrono via fila de mensagens.

---

## Arquitetura

Monorepo estruturado com:

- **API (Fastify)**: upload de imagens, consulta de status
- **Worker (Node.js)**: consumidor de fila, processamento com Sharp
- **MongoDB**: armazenamento de status e metadados
- **RabbitMQ**: gerenciamento de tarefas assíncronas
- **Docker**: execução isolada da aplicação e dependências

---

## Estrutura

```plaintext
image-optimizer/
├── apps/
│   ├── api/            # Upload e status via HTTP
│   └── worker/         # Processador das imagens
├── libs/               # Tipagens e utilitários
├── shared/             # Logger, config, helpers
├── docker-compose.yml  # Orquestração dos containers
├── .env                # Variáveis de ambiente
└── README.md
```

---

### Estrutura de diretórios (obrigatória)

Certifique-se de que os diretórios abaixo existem **antes de rodar a aplicação**:

- `uploads/`: onde a API salva temporariamente os arquivos recebidos
- `outputs/`: onde o Worker grava as imagens otimizadas

Essas pastas são compartilhadas entre os containers via volume no `docker-compose.yml`.  
Caso não existam, crie manualmente:

```bash
mkdir uploads outputs
```

> Alternativamente, crie um `.env` e aponte para caminhos existentes no sistema.

## Execução

### 1. Pré-requisitos

- Docker + Docker Compose

### 2. Subir o ambiente

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Variáveis de Ambiente

### ! Observações importantes sobre ambiente e execução

- As **variáveis de ambiente já estão definidas dentro do `docker-compose.yml`**, portanto **não é necessário criar `.env` manualmente** para rodar com Docker.
- O código utiliza **fallbacks padrão baseados no ambiente de containers**:
  - `process.env.UPLOAD_DIR || "uploads"`
  - `process.env.OUTPUT_DIR || "outputs"`
  - `process.env.IMAGE_QUALITY || 80`
- A conexão com MongoDB e RabbitMQ usa os **hostnames `mongo` e `rabbitmq`**, que funcionam automaticamente entre containers Docker.
  - Se quiser rodar localmente sem Docker, **substitua os hosts por `localhost`** nas variáveis.

### ⚙️ Escalando os workers com Docker

A arquitetura já está pronta para múltiplos workers.

Para escalar horizontalmente o consumo da fila:

```bash
docker-compose up --build --scale worker=6
```

Isso executa 6 instâncias simultâneas do worker, todas conectadas ao RabbitMQ, processando em paralelo.

> Testado com 50 imagens enfileiradas de forma massiva — todas processadas com sucesso, sem erros ou queda de performance.



Arquivo `.env`:

```env
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
IMAGE_QUALITY=80

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
MONGO_URL=mongodb://mongo:27017/image-optimizer
```

---

## Endpoints

### POST `/upload`

Enfileira uma nova imagem para processamento.

**Requisição**:

```bash
curl -F "file=@./imagem.jpg" http://localhost:3000/upload
```

**Resposta**:

```json
{
  "taskId": "abc123",
  "status": "pending"
}
```

---

### GET `/status/:taskId`

Consulta o status e resultado da tarefa.

**Exemplo**:

```bash
curl http://localhost:3000/status/abc123
```

**Resposta**:

```json
{
  "taskId": "abc123",
  "status": "completed",
  "originalMetadata": {
    "width": 1920,
    "height": 1080,
    "mimetype": "image/jpeg"
  },
  "processedAt": "2024-05-22T10:00:00.000Z",
  "versions": [
    {
      "label": "low",
      "path": "abc123/webp/low.webp",
      "width": 320,
      "height": 180,
      "sizeInBytes": 123456
    }
  ]
}
```

---

## Testes

```bash
npm install
npx vitest run
```

Teste unitário cobre o fluxo completo da função `processImage(...)` com mocks de `fs`, `sharp` e controle de dependências.

---

## Decisões Técnicas

- **Fastify**: mais leve e performático que Express
- **Arquitetura modular**: separação clara entre handler, service e repository
- **Injeção de logger e dependências via contexto**: facilita rastreamento com `taskId`
- **Fila assíncrona real**: padrão produtor/consumidor com retry controlado
- **Sharp**: biblioteca nativa para compressão e transformação de imagem
- **Vitest**: ambiente moderno de testes compatível com ESM + mocks globais

---

## Trade-offs

- Diretórios de saída e leitura são locais (não usam storage externo) por simplicidade
- Retry ocorre somente em erro temporário validado (`x-retries`)
- Uploads inválidos ou não-imagems são filtrados antes de serem aceitos

---

## Cobertura de Requisitos

- [x] Upload multipart
- [x] Fila assíncrona com RabbitMQ
- [x] Worker processando em múltiplos formatos e qualidades
- [x] Persistência em MongoDB com status e metadados
- [x] API de consulta de status
- [x] Dockerfile + docker-compose
- [x] Teste unitário isolado
- [x] Logs rastreáveis por `taskId`

---

## Observações Finais

- Projeto pronto para escalar com múltiplos workers
- Suporte nativo a formatos `webp` e `jpg`
- Logs centralizados via `pino`
