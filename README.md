# ⚙️ EngenhApp - Plataforma de Suporte à Decisão em Engenharia.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-blue)
![Stack](https://img.shields.io/badge/Stack-Vanilla_JS_%7C_Python_%7C_Flask_%7C_SQLite-success)

### 🚀 Sobre o Projeto
O **EngenhApp** é uma plataforma modular projetada para centralizar ferramentas de cálculo e consulta técnica. Desenvolvido para rodar como um serviço de rede local, ele permite que múltiplos usuários (estudantes ou engenheiros) acessem uma base de dados comum de materiais e módulos de cálculo através do navegador, eliminando a necessidade de planilhas dispersas e softwares pesados de instalação local.

### 🧠 O Problema
No ambiente acadêmico e industrial, a execução de cálculos de **Ciência dos Materiais** e **Física Clássica** sofre com:
1. **Dispersão de Dados:** Necessidade de consultar múltiplas tabelas e manuais físicos.
2. **Latência de Fórmulas:** Perda de tempo e risco de erros em cálculos repetitivos.
3. **Falta de Padronização:** Cada profissional utiliza sua própria versão de planilhas, gerando inconsistência nos resultados da equipe.

### ✨ Soluções e Funcionalidades
**1. Gestor de Ativos e Materiais**
Um banco de dados técnico escalável e de alta performance que oferece:
- **Filtros e Ordenação Avançada:** Organização instantânea por propriedades físicas (condutividade, densidade, tração, preço).
- **Visibilidade Customizada:** O usuário escolhe quais colunas de propriedades deseja visualizar ou ocultar na interface.
- **Ficha Técnica Detalhada:** Detalhamento completo e categorizado de cada material para setores específicos (Semicondutores, Civil, Elétrica).

**2. Motor de Cálculo de Engenharia**
Módulos independentes e integrados para processamento de fórmulas complexas (Dinâmica, Sistemas Fluido-mecânicos e Resistência dos Materiais), garantindo precisão e agilidade no desenvolvimento de projetos.

### 🛠️ Arquitetura e Stack Tecnológica
A aplicação foi arquitetada sob o princípio de "Zero Boilerplate", estruturada para ser extremamente leve, portátil e de fácil deploy:
- **Backend:** Python + **Flask**, servindo a API de forma modularizada.
- **Frontend:** HTML5, CSS3 e **JavaScript Puro (Vanilla JS)** garantindo máxima performance de renderização do DOM sem overhead de frameworks.
- **Persistência de Dados:** **SQLite**, garantindo consultas relacionais rápidas, paginação nativa e compactação em um único arquivo `.db`. _( Em migração )_

### 🌐 Distribuição em Rede Local
O diferencial técnico do EngenhApp é sua capacidade de atuar como um **Servidor Central**. Ao ser executado, o sistema fica disponível para qualquer dispositivo conectado à mesma rede (Workstations, Tablets ou Smartphones), facilitando o uso em canteiros de obras ou laboratórios.

**Como rodar o servidor:**
1. Clone o repositório: 
   ```bash
   git clone [https://github.com/Thayso-Weslley/EngenhApp](https://github.com/Thayso-Weslley/EngenhApp)
   
## Estrutura do Projeto

```
EngenhApp/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dinamica/
│   │   ├── estatica/
│   │   ├── engenharia/
│   │   ├── auth_routes.py
│   │   ├── repositorio_base_routes.py
│   │   ├── repositorio_usuario_routes.py
│   │   └── ( demais arquivos de routas )
│   ├── templates/
│   │   ├── index.html
│   │   └── login.html
│   └── static/
│       ├── css/
│       │   ├── catalogo.css
│       │   ├── modal.css
│       │   └── style.css
│       ├── img/
│       └── js/
│           ├── api.js
│           ├── main.js
│           ├── UI.js
│           └── UI/
│               ├── dinamicaUI.js
│               ├── estaticaUI.js
│               ├── materiaisUI.js
│               ├── menuUI.js
│               └── ( demais UI )
├── Formulas_e_calculos/
│   ├── __init__.py
│   ├── dinamica/
│   ├── estatica/
│   ├── engenharia/
│   └── ( demais módulos )
├── Lista_Materiais/
│   ├── __init__.py
│   ├── catalogo_json/
│   │   ├── Carbeto_de_Silicio_(SiC).json     # primeiro material criado
│   │   └── ( materiais do sistema )
│   ├── listas_usuario/
│   │   └── ( Listas e Materiais salvos pelo usuário )
│   ├── repositorio_base.py
│   └── repositorio_usuario.py
└── run.py
```
