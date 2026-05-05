# ⛽ Fuel Management System (Sistema de Gestão de Abastecimento)

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Python](https://img.shields.io/badge/Backend-FastAPI%20%28Python%29-blue)
![Angular](https://img.shields.io/badge/Frontend-Angular%20%2B%20Ionic-red)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

Um sistema full-stack completo para gestão de abastecimentos, controle de veículos e análise de consumo de combustível. Desenvolvido com foco em performance e usabilidade mobile-first.

## ✨ Funcionalidades

* **Gestão de Veículos:** Cadastro e controle múltiplo de veículos (carros, motos, caminhões).
* **Registro de Abastecimentos:** Histórico completo de paradas no posto, incluindo litros, valor total, quilometragem e tipo de combustível.
* **Dashboards Interativos:** Gráficos dinâmicos (via Chart.js) para análise de gastos mensais e tendências de consumo.
* **Ranking de Postos:** Avaliação automática dos postos de gasolina baseada na autonomia (km/l) gerada por seus combustíveis.
* **Análise Preditiva:** Estimativas de autonomia e previsões de gastos futuros baseadas no histórico do usuário.
* **Controle de Metas:** Definição e acompanhamento de orçamentos mensais para gastos com combustível.
* **Exportação em PDF:** Geração de relatórios profissionais detalhados para controle financeiro.

## 🛠️ Tecnologias Utilizadas

### Backend (API)
* **Python 3.10+**
* **FastAPI:** Framework web moderno e de alta performance.
* **SQLAlchemy & Pydantic:** ORM e validação/serialização de dados.
* **PostgreSQL:** Banco de dados relacional hospedado na nuvem (Neon).
* **Render:** Plataforma de deploy da API.

### Frontend (Mobile/Web)
* **Angular 17+**
* **Ionic Framework:** Para componentes de interface nativos e responsivos (Mobile-first).
* **Chart.js:** Biblioteca para renderização dos gráficos de desempenho.
* **Vercel:** Plataforma de deploy do frontend.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Python 3.10+
* Node.js 18+ e npm
* Angular CLI (`npm install -g @angular/cli`)
* Ionic CLI (`npm install -g @ionic/cli`)

### 1. Configurando o Backend (FastAPI)
```bash
# Navegue até a pasta do backend
cd backend

# Crie um ambiente virtual e ative-o
python -m venv venv
source venv/bin/activate  # No Windows use: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Crie um arquivo .env na raiz do backend baseado no .env.example
# e configure sua string de conexão do banco de dados (DATABASE_URL)

# Execute o servidor de desenvolvimento
uvicorn main:app --reload
# A API estará disponível em http://localhost:8000
# A documentação automática (Swagger UI) em http://localhost:8000/docs
```

### 2. Configurando o Frontend (Angular/Ionic)
```bash
# Em um novo terminal, navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
ionic serve
# A aplicação estará disponível em http://localhost:8100
```

## ☁️ Deploy

Este projeto está preparado para deploy em nuvem:
* **Backend:** Projetado para ser hospedado no [Render](https://render.com) ou Railway.
* **Frontend:** Projetado para a [Vercel](https://vercel.com) ou Netlify.
* **Banco de Dados:** Servidor PostgreSQL Serverless no [Neon](https://neon.tech) ou Supabase.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Se você tem alguma ideia para melhorar o sistema, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/NovaFuncionalidade`)
3. Faça o Commit de suas mudanças (`git commit -m 'Add: nova funcionalidade incrível'`)
4. Faça o Push para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT.
