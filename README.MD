# 🏥 Jornada do Paciente - Backend API

API REST desenvolvida em Django + Django Rest Framework para gerenciar a jornada de pacientes no programa **Paraíba Contra o Câncer**.

## 📌 Descrição

O **Jornada do Paciente** é uma plataforma digital voltada para resolver a fragmentação e a falta de visibilidade no acompanhamento de pacientes dentro da rede pública de saúde.

Atualmente, muitos processos relacionados a consultas, exames e regulação são descentralizados, manuais ou pouco integrados, o que pode gerar atrasos, retrabalho e dificuldade no monitoramento da evolução do paciente.

Este sistema propõe uma solução centralizada que permite o acompanhamento contínuo da jornada do paciente — desde o cadastro até a realização de exames, teleconsultas e diagnósticos — garantindo maior eficiência operacional, transparência das informações e suporte à tomada de decisão clínica.

## 🎯 Objetivo

- Centralizar informações da jornada do paciente
- Melhorar o fluxo de atendimento na rede de saúde
- Reduzir falhas e atrasos em processos clínicos
- Facilitar o acompanhamento por profissionais de saúde
- Oferecer mais autonomia e visibilidade ao paciente

## 👥 Tipos de Usuários

- **Administrador**
  - Gerencia usuários, médicos e configurações do sistema
  - Acompanha indicadores gerais

- **Médico da UBS**
  - Responsável pelo atendimento inicial do paciente
  - Auxilia na organização de consultas, exames e encaminhamentos

- **Oncologista**
  - Realiza diagnósticos finais de câncer
  - Acompanha pacientes diagnosticados positivamente

- **Paciente**
  - Acompanha sua própria jornada
  - Visualiza atendimentos, teleconsultas, exames e diagnósticos

---

## 🛠️ Tecnologias

- **Framework:** Django
- **API:** Django Rest Framework (DRF)
- **Autenticação:** JWT (JSON Web Tokens)
- **Banco de Dados:** PostgreSQL
- **Paginação:** Implementada em todos os endpoints

---

## 📦 Pré-requisitos

- Python 3.9+
- PostgreSQL 12+
- Git
- pip

Verifique a instalação:
```bash
python --version
psql --version
```

---

## 🚀 Instalação e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/jornada-do-paciente.git
cd jornada-do-paciente
```

### 2. Crie e Ative o Ambiente Virtual

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Instale as Dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o Banco de Dados PostgreSQL

Crie o banco de dados:

```bash
psql -U postgres
```

Execute os comandos SQL:

```sql
CREATE DATABASE jornada_do_paciente;
CREATE USER jornada_user WITH PASSWORD 'sua_senha_segura';
ALTER ROLE jornada_user SET client_encoding TO 'utf8';
ALTER ROLE jornada_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE jornada_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE jornada_do_paciente TO jornada_user;
\q
```

### 5. Configure Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DEBUG=True
SECRET_KEY=sua_chave_secreta_aqui
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=jornada_do_paciente
DB_USER=jornada_user
DB_PASSWORD=sua_senha_segura
DB_HOST=localhost
DB_PORT=5432
```

### 6. Execute as Migrações

```bash
python manage.py migrate
```

### 7. Crie um Superusuário (Admin)

```bash
python manage.py createsuperuser
```

Siga as instruções para criar um usuário administrador.

### 8. Inicie o Servidor

```bash
python manage.py runserver
```

A API estará disponível em: **`http://localhost:8000`**

O painel admin estará em: **`http://localhost:8000/admin`**

---

## 📊 Estrutura do Projeto

```
jornada/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── urls.py          # Rotas dos endpoints
│   │   │   ├── viewsets.py      # Lógica dos endpoints
│   │   │   └── serializers.py   # Serialização de dados
│   │   └── __init__.py
│   ├── models.py                # Modelos de dados
│   ├── admin.py                 # Configuração do admin
│   ├── apps.py
│   └── migrations/
├── jornada/
│   ├── settings.py              # Configurações Django
│   ├── urls.py                  # URLs principais
│   └── wsgi.py
├── manage.py
└── requirements.txt
```

---

## 🔐 Autenticação (JWT)

### Obter Token de Acesso

```http
POST /api/v1/token/
Content-Type: application/json

{
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

**Resposta (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Usar o Token nas Requisições

Adicione o token no header `Authorization`:

```http
Authorization: Bearer seu_token_jwt_aqui
```

### Renovar Token Expirado

```http
POST /api/v1/token/refresh/
Content-Type: application/json

{
  "refresh": "seu_token_refresh"
}
```

---

## 📡 Endpoints da API

Todos os endpoints retornam dados paginados (padrão: 5 itens por página).

### Filtros e Paginação

Para alterar o tamanho da página:
```
?page=2&page_size=10
```

**Exemplo de requisição com paginação:**
```
GET /api/v1/pacientes/?page=2&page_size=5
```

---

### 🏥 **Unidades Básicas de Saúde**

#### Listar Unidades

```http
GET /api/v1/unidades/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/v1/unidades/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "nome": "UBS Central",
      "cnes": "1234567",
      "cidade": "João Pessoa",
      "estado": "PB",
      "endereco": "Rua Principal, 100",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Criar Unidade

```http
POST /api/v1/unidades/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "nome": "UBS Teste",
  "cnes": "7654321",
  "cidade": "Campina Grande",
  "estado": "PB",
  "endereco": "Rua Teste, 50"
}
```

#### Obter Detalhes

```http
GET /api/v1/unidades/{id}/
Authorization: Bearer seu_token
```

#### Atualizar

```http
PUT /api/v1/unidades/{id}/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "nome": "UBS Central Atualizada",
  "endereco": "Rua Nova, 200"
}
```

#### Deletar (Soft Delete)

```http
DELETE /api/v1/unidades/{id}/
Authorization: Bearer seu_token
```

---

### 👤 **Usuários**

#### Listar Usuários

```http
GET /api/v1/users/
Authorization: Bearer seu_token
```

#### Criar Usuário

```http
POST /api/v1/users/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "username": "joao.silva",
  "email": "joao@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "password": "senha_segura_123"
}
```

#### Obter Detalhes

```http
GET /api/v1/users/{id}/
Authorization: Bearer seu_token
```

---

### 🏥 **CRM (Conselho Regional de Medicina)**

#### Listar CRMs

```http
GET /api/v1/crm/
Authorization: Bearer seu_token
```

#### Criar CRM

```http
POST /api/v1/crm/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "numero": "123456/PB"
}
```

---

### 👨‍⚕️ **Médicos**

#### Listar Médicos

```http
GET /api/v1/medicos/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "dra.maria",
        "first_name": "Maria",
        "last_name": "Santos"
      },
      "tipo": "ubs",
      "ubs": {
        "id": 1,
        "nome": "UBS Central"
      },
      "crm": {
        "id": 1,
        "numero": "123456/PB"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Criar Médico

```http
POST /api/v1/medicos/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "user_id": 2,
  "tipo": "ubs",
  "ubs_id": 1,
  "crm_id": 1
}
```

**Tipos de Médico:**
- `ubs` - Médico da UBS
- `oncologista` - Oncologista do Paraíba Contra o Câncer

#### Obter Detalhes

```http
GET /api/v1/medicos/{id}/
Authorization: Bearer seu_token
```

---

### 🏨 **Hospitais de Tratamento**

#### Listar Hospitais

```http
GET /api/v1/hospitais/
Authorization: Bearer seu_token
```

#### Criar Hospital

```http
POST /api/v1/hospitais/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "nome": "Hospital Oncológico Central",
  "cnes": "9876543",
  "cidade": "João Pessoa",
  "estado": "PB",
  "endereco": "Avenida Brasil, 1000"
}
```

---

### 🧑‍🤝‍🧑 **Pacientes**

#### Listar Pacientes

```http
GET /api/v1/pacientes/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/v1/pacientes/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "username": "maria.santos"
      },
      "nome": "Maria dos Santos",
      "nome_social": "",
      "cpf": "12345678901",
      "cartao_sus": "123456789012345",
      "data_nascimento": "1990-05-20",
      "telefone": "(83) 98765-4321",
      "endereco": "Rua A, 100",
      "sexo": "F",
      "raca_cor": "parda",
      "ubs": {
        "id": 1,
        "nome": "UBS Central"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Criar Paciente

```http
POST /api/v1/pacientes/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "user_id": 5,
  "nome": "Maria dos Santos",
  "cpf": "12345678901",
  "cartao_sus": "123456789012345",
  "data_nascimento": "1990-05-20",
  "telefone": "(83) 98765-4321",
  "endereco": "Rua A, 100",
  "sexo": "F",
  "raca_cor": "parda",
  "ubs_id": 1
}
```

**Sexos válidos:** `M`, `F`, `O`  
**Raça/Cor:** `branca`, `preta`, `parda`, `amarela`, `indigena`, `nao_info`

---

### 🩺 **Atendimentos**

#### Listar Atendimentos

```http
GET /api/v1/atendimentos/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 30,
  "next": "http://localhost:8000/api/v1/atendimentos/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "paciente": {
        "id": 1,
        "nome": "Maria dos Santos"
      },
      "medico": {
        "id": 1,
        "user": { "first_name": "Maria", "last_name": "Santos" }
      },
      "ubs": {
        "id": 1,
        "nome": "UBS Central"
      },
      "data_atendimento": "2024-01-15T14:30:00Z",
      "observacao_clinica": "Paciente apresenta..."
    }
  ]
}
```

#### Criar Atendimento

```http
POST /api/v1/atendimentos/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "paciente_id": 1,
  "medico_id": 1,
  "ubs_id": 1,
  "data_atendimento": "2024-01-20T14:30:00Z",
  "observacao_clinica": "Avaliação inicial do paciente..."
}
```

**Validações:**
- O paciente, médico e UBS devem estar associados à mesma unidade

---

### 📞 **Teleconsultas**

#### Listar Teleconsultas

```http
GET /api/v1/teleconsultas/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 20,
  "next": "http://localhost:8000/api/v1/teleconsultas/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "atendimento": {
        "id": 1,
        "paciente": { "nome": "Maria dos Santos" }
      },
      "link": "https://meet.google.com/abc-defg-hij",
      "status": "agendada",
      "data_agendada": "2024-01-25T10:00:00Z",
      "data_realizada": null
    }
  ]
}
```

#### Criar Teleconsulta

```http
POST /api/v1/teleconsultas/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "atendimento_id": 1,
  "link": "https://meet.google.com/abc-defg-hij",
  "data_agendada": "2024-01-25T10:00:00Z"
}
```

**Status válidos:**
- `agendada` - Teleconsulta agendada
- `realizada` - Teleconsulta realizada
- `cancelada` - Teleconsulta cancelada

#### Atualizar Status

```http
PATCH /api/v1/teleconsultas/{id}/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "status": "realizada",
  "data_realizada": "2024-01-25T10:30:00Z"
}
```

---

### 🔄 **Retorno de Teleconsulta**

#### Listar Retornos

```http
GET /api/v1/retorno-teleconsulta/
Authorization: Bearer seu_token
```

#### Criar Retorno

```http
POST /api/v1/retorno-teleconsulta/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "teleconsulta_id": 1,
  "link": "https://meet.google.com/xyz-uvwx-yz",
  "data_agendada": "2024-02-01T10:00:00Z"
}
```

**Status válidos:**
- `agendado`
- `realizado`
- `cancelado`

---

### 🧪 **Solicitações de Exame**

#### Listar Solicitações

```http
GET /api/v1/solicitacoes-exame/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/v1/solicitacoes-exame/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "teleconsulta": {
        "id": 1,
        "status": "realizada"
      },
      "retorno": null,
      "descricao": "Tomografia de tórax com contraste",
      "data_solicitacao": "2024-01-20T15:00:00Z"
    }
  ]
}
```

#### Criar Solicitação

```http
POST /api/v1/solicitacoes-exame/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "teleconsulta_id": 1,
  "descricao": "Tomografia de tórax com contraste venoso"
}
```

ou

```json
{
  "retorno_id": 1,
  "descricao": "Ressonância magnética de abdômen"
}
```

**Validações:**
- A solicitação deve estar vinculada a uma teleconsulta OU um retorno (não ambos)

---

### 📋 **Resultados de Exame**

#### Listar Resultados

```http
GET /api/v1/resultados-exame/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "solicitacao": {
        "id": 1,
        "descricao": "Tomografia de tórax com contraste"
      },
      "resultado": "Resultado dentro dos limites normais. Sem achados significativos...",
      "data_resultado": "2024-01-25T09:00:00Z"
    }
  ]
}
```

#### Criar Resultado

```http
POST /api/v1/resultados-exame/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "solicitacao_id": 1,
  "resultado": "Tomografia de tórax: Resultado dentro dos limites normais..."
}
```

---

### 🔍 **Diagnósticos**

#### Listar Diagnósticos

```http
GET /api/v1/diagnosticos/
Authorization: Bearer seu_token
```

**Resposta:**
```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "retorno": {
        "id": 1,
        "teleconsulta": { "id": 1 }
      },
      "medico": {
        "id": 2,
        "tipo": "oncologista",
        "crm": { "numero": "123456/PB" }
      },
      "hospital": {
        "id": 1,
        "nome": "Hospital Oncológico Central"
      },
      "positivo": "S",
      "tipo_cancer": "Câncer de mama",
      "descricao": "Diagnóstico positivo confirmado. Paciente apresenta...",
      "data_diagnostico": "2024-01-26T11:00:00Z"
    }
  ]
}
```

#### Criar Diagnóstico

```http
POST /api/v1/diagnosticos/
Authorization: Bearer seu_token
Content-Type: application/json

{
  "retorno_id": 1,
  "medico_id": 2,
  "hospital_id": 1,
  "positivo": "S",
  "tipo_cancer": "Câncer de mama",
  "descricao": "Diagnóstico positivo de câncer de mama estágio II. Recomenda-se..."
}
```

ou negativo:

```json
{
  "retorno_id": 1,
  "medico_id": 2,
  "positivo": "N",
  "descricao": "Resultado negativo. Paciente não apresenta indicadores..."
}
```

**Validações:**
- Apenas médicos oncologistas podem fazer diagnósticos
- Se positivo (`S`), o `tipo_cancer` é obrigatório
- Se negativo (`N`), `tipo_cancer` é opcional

---

## 🐛 Troubleshooting

**Erro: "ModuleNotFoundError: No module named 'django'"**

Verifique se o ambiente virtual está ativado:
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

**Erro ao conectar ao PostgreSQL**

Certifique-se de que:
1. PostgreSQL está rodando
2. As credenciais no `.env` estão corretas
3. O banco `jornada_do_paciente` foi criado

**Erro: "FATAL: Ident authentication failed"**

Atualize as credenciais no `.env` e tente novamente.

---

## 📝 Notas sobre Soft Delete

O sistema implementa soft delete (exclusão lógica) em todos os modelos. Registros deletados não aparecem nas listagens normais, mas podem ser recuperados usando a ação de restauração.

---

## 📧 Suporte

Para problemas ou dúvidas, abra uma [issue](https://github.com/seu-usuario/jornada-do-paciente/issues) no repositório.

---

**Última atualização:** Maio de 2024
