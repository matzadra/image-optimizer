
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