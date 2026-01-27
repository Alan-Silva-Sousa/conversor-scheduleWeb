📊 Conversor de Escalas Genesys → Excel

Aplicação web para converter arquivos TXT de escalas do Genesys em planilhas Excel (.xlsx), organizando dias trabalhados e horários, com visualização clara e padronizada.

O projeto foi desenvolvido para funcionar:

✔️ Localmente (modo desenvolvimento)

✔️ Em container Docker

✔️ Embedado no Genesys Cloud (Embedded App)

🚀 Funcionalidades

Upload de arquivo .txt exportado do Genesys

Extração automática de:

Nome do agente

Datas trabalhadas

Horário de início e fim

Geração de Excel com duas abas:

Dias Trabalhados

Horários Trabalhados

Preenchimento automático:

T (Trabalhou) → célula verde

F (Não trabalhou) → célula branca

Cabeçalho com datas no formato DD/MM/YYYY

Compatível com autenticação do Genesys Cloud

🧱 Estrutura do Projeto
conversor-genesys/
├─ src/
│  ├─ server.ts          # Servidor Express (upload e download)
│  └─ txtProcessor.ts   # Processamento TXT → Excel
│
├─ public/
│  └─ index.html        # Interface Web + Genesys Embedded Auth
│
├─ dist/                # Build TypeScript (gerado)
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ tsconfig.json
└─ README.md

🖥️ Tecnologias Utilizadas

Node.js 20

TypeScript

Express

Multer (upload de arquivos)

ExcelJS (geração de XLSX)

Docker

Traefik (HTTPS + DNS)

Genesys Cloud JavaScript SDK

🔐 Integração com Genesys Cloud

O projeto suporta autenticação via Implicit Grant do Genesys Cloud.

✔️ Comportamento esperado:

Dentro do Genesys (Embedded App)
→ autentica automaticamente
→ libera upload do arquivo

Fora do Genesys (localhost / DEV)
→ ignora autenticação
→ upload liberado automaticamente

Isso permite desenvolvimento local sem dependência do ambiente Genesys.

▶️ Rodando Localmente (DEV)
1️⃣ Instalar dependências
npm install

2️⃣ Rodar em modo desenvolvimento
npm run dev


Acesse:

http://localhost:3000

🐳 Rodando com Docker
Build e execução
docker compose up -d --build


A aplicação ficará disponível na porta configurada (ex: 3000).

🌐 Produção com HTTPS (Traefik)

O projeto já está preparado para rodar atrás do Traefik, com:

DNS personalizado

HTTPS automático (Let’s Encrypt)

Ideal para uso com Genesys Embedded App

Exemplo de stack:

Docker

Traefik

DNS público válido

📄 Formato do TXT de Entrada

Exemplo esperado:

Guilherme Amaro Monday, 12/01/2025, 11:40 am to 6 pm


O sistema reconhece automaticamente:

Nome do agente

Dia da semana

Data

Horário inicial e final

📊 Estrutura do Excel Gerado
Aba: Dias Trabalhados
Usuário	01/12/2025	02/12/2025
Guilherme Amaro	T	F
Aba: Horários Trabalhados
Usuário	01/12/2025
Guilherme Amaro	11:40 - 18:00
⚠️ Observações Importantes

Genesys exige HTTPS para Embedded Apps

O login Genesys não funciona em localhost

O upload só é bloqueado quando a autenticação Genesys falha dentro do embed

👨‍💻 Autor

Desenvolvido para automação e padronização de escalas do Genesys Cloud, com foco em:

Confiabilidade

Clareza de dados

Facilidade de uso para agentes e gestores