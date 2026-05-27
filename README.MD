# Jornada do Paciente

Sistema web para gerenciamento da jornada de pacientes, com backend em Django REST Framework e frontend em React + Vite.

## Tecnologias

- Backend: Python, Django, Django REST Framework e Simple JWT
- Frontend: React, TypeScript, Vite e Axios
- Banco de dados padrao: SQLite
- Banco opcional: PostgreSQL via arquivo `.env`

## Enderecos locais

Depois que os dois servidores estiverem rodando:

- Frontend: http://localhost:5173
- Backend/API: http://127.0.0.1:8000/api/v1/
- Documentacao da API: http://127.0.0.1:8000/api/docs/
- Admin do Django: http://127.0.0.1:8000/admin/

Para usar o sistema em desenvolvimento, deixe dois terminais abertos: um para o backend e outro para o frontend.

## Contas de teste

Todas as contas abaixo usam a senha:

```text
123456
```

| Perfil | E-mail |
| --- | --- |
| Medico UBS | `medico@ubs.com` |
| Paciente | `paciente@teste.com` |
| Administrador | `admin@admin.com` |
| Oncologista | `oncologista@teste.com` |
| Oncologista | `oncologista22@teste.com` |

---

## Rodar pela primeira vez no Windows

### 1. Instalar os pre-requisitos

Instale:

- Git
- Python 3
- Node.js

Confirme se os comandos estao funcionando:

```powershell
git --version
python --version
node --version
npm --version
```

### 2. Baixar o projeto

Se ainda nao tiver o projeto na maquina:

```powershell
git clone <url-do-repositorio>
cd jornada_do_paciente
```

Se voce ja recebeu a pasta do projeto, apenas entre nela:

```powershell
cd C:\caminho\para\jornada_do_paciente
```

### 3. Configurar e rodar o backend

No primeiro terminal:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd back_end
python manage.py migrate
python manage.py runserver
```

Se o PowerShell bloquear a ativacao do ambiente virtual, rode:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Depois feche e abra o terminal novamente, entre na pasta do projeto e repita a ativacao:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Configurar e rodar o frontend

Abra um segundo terminal:

```powershell
cd C:\caminho\para\jornada_do_paciente\front_end
npm install
npm run dev
```

Acesse no navegador:

```text
http://localhost:5173
```

---

## Rodar pela primeira vez no Linux

### 1. Instalar os pre-requisitos

Instale:

- Git
- Python 3
- `python3-venv`
- Node.js
- npm

Em distribuicoes baseadas em Ubuntu/Debian:

```bash
sudo apt update
sudo apt install git python3 python3-venv python3-pip nodejs npm
```

Confirme se os comandos estao funcionando:

```bash
git --version
python3 --version
node --version
npm --version
```

### 2. Baixar o projeto

Se ainda nao tiver o projeto na maquina:

```bash
git clone <url-do-repositorio>
cd jornada_do_paciente
```

Se voce ja recebeu a pasta do projeto, apenas entre nela:

```bash
cd /caminho/para/jornada_do_paciente
```

### 3. Configurar e rodar o backend

No primeiro terminal:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cd back_end
python manage.py migrate
python manage.py runserver
```

### 4. Configurar e rodar o frontend

Abra um segundo terminal:

```bash
cd /caminho/para/jornada_do_paciente/front_end
npm install
npm run dev
```

Acesse no navegador:

```text
http://localhost:5173
```

---

## Rodar novamente no Windows

Use estes passos quando o projeto ja estiver instalado na maquina.

### Backend

No primeiro terminal:

```powershell
cd C:\caminho\para\jornada_do_paciente
.\.venv\Scripts\Activate.ps1
cd back_end
python manage.py migrate
python manage.py runserver
```

### Frontend

No segundo terminal:

```powershell
cd C:\caminho\para\jornada_do_paciente\front_end
npm run dev
```

Se alguem alterou as dependencias do frontend, rode antes:

```powershell
npm install
```

---

## Rodar novamente no Linux

Use estes passos quando o projeto ja estiver instalado na maquina.

### Backend

No primeiro terminal:

```bash
cd /caminho/para/jornada_do_paciente
source .venv/bin/activate
cd back_end
python manage.py migrate
python manage.py runserver
```

### Frontend

No segundo terminal:

```bash
cd /caminho/para/jornada_do_paciente/front_end
npm run dev
```

Se alguem alterou as dependencias do frontend, rode antes:

```bash
npm install
```

---

## Configuracao opcional com PostgreSQL

O projeto usa SQLite por padrao, entao nao precisa instalar PostgreSQL para rodar localmente.

Se quiser usar PostgreSQL, crie um arquivo `.env` dentro da pasta `back_end`:

```env
USE_POSTGRES=true
DATABASE_NAME=jornada_do_paciente
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

Depois instale o driver do PostgreSQL no ambiente virtual:

```bash
pip install psycopg2-binary
```

E rode as migracoes novamente dentro da pasta `back_end`:

```bash
python manage.py migrate
```

---

## Variaveis opcionais

### Backend

O arquivo `back_end/.env` pode receber:

```env
SECRET_KEY=sua_chave_secreta
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend

O frontend usa por padrao:

```text
http://127.0.0.1:8000/api/v1/
```

Se precisar apontar para outro backend, crie `front_end/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1/
```

Depois reinicie o servidor do frontend.

---

## Comandos uteis

### Backend

Rodar migracoes:

```bash
cd back_end
python manage.py migrate
```

Criar usuario administrador:

```bash
cd back_end
python manage.py createsuperuser
```

Rodar testes do Django:

```bash
cd back_end
python manage.py test
```

### Frontend

Rodar em desenvolvimento:

```bash
cd front_end
npm run dev
```

Gerar build:

```bash
cd front_end
npm run build
```

Rodar lint:

```bash
cd front_end
npm run lint
```

---

## Problemas comuns

### A porta 8000 ja esta em uso

Rode o backend em outra porta:

```bash
python manage.py runserver 8001
```

Se fizer isso, atualize o `VITE_API_URL` no frontend para:

```env
VITE_API_URL=http://127.0.0.1:8001/api/v1/
```

### A porta 5173 ja esta em uso

O Vite pode oferecer outra porta automaticamente. Use a URL exibida no terminal.

### O comando `python` nao funciona no Linux

Use `python3` no lugar de `python`.

### O frontend nao conecta no backend

Confira se:

- O backend esta rodando.
- O frontend esta usando a URL correta da API.
- A URL termina com `/api/v1/`.
