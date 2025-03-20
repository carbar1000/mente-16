// Technical_Specs.md

# Especificações Técnicas do Projeto Webform-Mente-13

## 1. Visão Geral
Sistema de formulário web para coleta de dados sobre perfil empreendedor, com armazenamento duplo (Google Sheets + Supabase) e hospedagem no Vercel.

## 2. Arquitetura

### 2.1 Frontend
- HTML5 estático
- CSS3 com variáveis personalizadas
- JavaScript vanilla para interatividade
- Sem frameworks externos

### 2.2 Backend
- Google Apps Script para integração com Google Sheets
- Supabase para banco de dados
- Serverless functions no Vercel (se necessário)

### 2.3 Estrutura de Arquivos
```
webform-mente-13/
├── index.html           # Página principal do formulário
├── obrigado.html       # Página de agradecimento
├── webform-mente.css   # Estilos principais
├── obrigado.css        # Estilos da página de agradecimento
├── webform-mente.js    # Lógica principal
├── webform-mente-navigate.js # Navegação do formulário
└── form-handler.js     # Manipulação de envio do formulário
```

## 3. Integrações

### 3.1 Google Sheets
- Endpoint: 'https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec'
- Método: POST
- Campos:
  - csrf_token
  - timestamp
  - Cor favorita (A)
  - Animal favorito (B)
  - Hobby favorito (C)
  - Nome
  - Email

### 3.2 Supabase

SUPABASE_URL=https://lxwljusqjxudgqsnvjnh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4d2xqdXNxanh1ZGdxc252am5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDkyODIsImV4cCI6MjA1NjQyNTI4Mn0.cTeq659XWygbWEEelcic85BhsqjIYSO_w3X7PYwcB70
S

```sql
CREATE TABLE respostas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW()),
    A TEXT,
    B TEXT,
    C TEXT,
    nome TEXT,
    email TEXT
);
```

## 4. Segurança

### 4.1 Medidas Implementadas
- CSRF Token dinâmico
- Validação de entrada no cliente e servidor
- Sanitização de dados
- 

### 4.2 Variáveis de Ambiente (Vercel)

SUPABASE_URL=sua_url
SUPABASE_ANON_KEY=sua_chave
GOOGLE_SHEET_ID=seu_id
```

As variáveis do Supabase (`SUPABASE_URL` e `SUPABASE_ANON_KEY`) devem ser definidas no ficheiro `.env.local` para ambiente de teste local e nas configurações de variáveis de ambiente não públicas do Vercel para produção online.

## 5. Fluxo de Dados
1. Usuário preenche formulário
2. Validação client-side
3. Envio em sequência de forma que não haja atropelo ou conflito entre os envios
   - Google Sheets via Apps Script com o script no lado do clente
   - Supabase via API REST
4. Redirecionamento para obrigado.html
   - Redirecionamento para obrigado.html se tiver sucesso em ambas as integrações
   - Redirecionamento para obrigado.html se tiver sucesso em pelo menos uma integração

## 6. Requisitos de Deploy (Vercel)
- Node.js >= 14.x
- Build command: N/A (static HTML)
- Output directory: ./
- Environment variables configuradas
- Domínio personalizado (opcional)






