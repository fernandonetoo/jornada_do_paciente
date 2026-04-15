# 🏥 Jornada do Paciente

Sistema web desenvolvido para gerenciar e otimizar a jornada de pacientes no programa **Paraíba Contra o Câncer**, promovendo integração entre profissionais de saúde, pacientes e gestão administrativa.

---

## 📌 Descrição

O **Jornada do Paciente** é uma plataforma digital voltada para resolver a fragmentação e a falta de visibilidade no acompanhamento de pacientes dentro da rede pública de saúde.

Atualmente, muitos processos relacionados a consultas, exames e regulação são descentralizados, manuais ou pouco integrados, o que pode gerar atrasos, retrabalho e dificuldade no monitoramento da evolução do paciente.

Este sistema propõe uma solução centralizada que permite o acompanhamento contínuo da jornada do paciente — desde o cadastro até a realização de exames e consultas — garantindo maior eficiência operacional, transparência das informações e suporte à tomada de decisão clínica.

---

## 🎯 Objetivo

- Centralizar informações da jornada do paciente
- Melhorar o fluxo de atendimento na rede de saúde
- Reduzir falhas e atrasos em processos clínicos
- Facilitar o acompanhamento por profissionais de saúde
- Oferecer mais autonomia e visibilidade ao paciente

---

## ⚙️ Funcionalidades

- 👤 Cadastro e edição de usuários  
- 📊 Dashboard da jornada do paciente  
- 🩺 Gerenciamento de consultas  
- 🧪 Gerenciamento de exames  
- 🔄 Gestão de regulação  
- 📍 Acompanhamento completo do fluxo do paciente  

---

## 👥 Tipos de Usuários

- **Administrador**
  - Gerencia usuários e configurações do sistema
  - Acompanha indicadores gerais

- **Médico Navegador**
  - Responsável por acompanhar a jornada do paciente
  - Auxilia na organização de consultas, exames e encaminhamentos

- **Paciente**
  - Acompanha sua própria jornada
  - Visualiza consultas, exames e status do atendimento

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React.js / Next.js  
- **Backend:** Django + Django Rest Framework (DRF)  
- **API:** RESTful com versionamento para escalabilidade  
- **Banco de Dados:** PostgreSQL  
- **Prototipação:** Figma (opcional)

---

## 🧱 Arquitetura

O sistema segue uma arquitetura baseada em APIs REST, permitindo:

- Separação clara entre frontend e backend  
- Escalabilidade da aplicação  
- Versionamento de APIs  


---

## 🚀 Como Rodar o Projeto

### 🔧 Pré-requisitos

- Python 3.x  
- Node.js  
- PostgreSQL  
- Git  

---

### 📥 Clone o repositório

## 🚀 Como rodar o projeto (Backend - Django + DRF)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/jornada-do-paciente.git
cd jornada-do-paciente

# 2. Crie o ambiente virtual
python -m venv venv

# 3. Ative o ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 4. Instale as dependências
pip install -r requirements.txt

# 5. Execute as migrações
python manage.py migrate

# 6. Inicie o servidor
python manage.py runserver
```
## ⚙️ Configuração do Banco de Dados (PostgreSQL)

Antes de rodar o servidor, configure o banco no arquivo settings.py:

```Bash
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'jornada_db',
        'USER': 'seu_usuario',
        'PASSWORD': 'sua_senha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
