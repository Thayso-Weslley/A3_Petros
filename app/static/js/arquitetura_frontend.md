# 🗺️ Mapa de Arquitetura do Front-end (SPA Modular)
Este documento serve como o guia oficial da estrutura, responsabilidades e fluxos táticos do ecossistema JavaScript do projeto, estruturado sob os princípios de Separação de Conceitos (SoC) e Orientação a Objetos.

---

## 📁 Árvore de Diretórios do Front-end

```text
app/
└── static/
    └── js/
        ├── api.js
        ├── main.js
        └── UI/
            ├── baseUI.js
            ├── componentes/
            │   └── materiaisGrid.js
            └── telas/
                ├── catalogoUI.js
                ├── inventarioUI.js
                └── loginUI.js
```

## 🛠️ O Papel Tático de Cada Arquivo

#### 🚀 Arquivos Raiz (Orquestração e Infraestrutura)
#### 1. `main.js` (O Orquestrador Central / Cérebro)

+ Responsabilidade: Atua como o ponto de entrada (`entry point`) único da aplicação. É o maestro que faz a engrenagem começar a girar assim que o evento `DOMContentLoaded` é disparado pelo navegador.

+ Funções Principais:

    - Captura e gerencia o sistema de rotas internas da Single Page Application (SPA), determinando qual tela deve ser renderizada no contêiner principal com base na ação do usuário ou na mudança de hash.

    - Instancia as classes das telas (`catalogoUI`, `inventarioUI`, `loginUI`) e injeta nelas as dependências necessárias (como o gateway de `API`).

    - Garante que múltiplos componentes não tentem reescrever o mesmo contêiner de forma desordenada.

#### 2. `api.js` (O Gateway de Comunicação / Coração do I/O)
- **Responsabilidade**: Centralizar de forma estrita absolutamente todas as requisições HTTP (`fetch`) enviadas ao servidor back-end Flask. Nenhum outro arquivo do front-end tem permissão para usar a palavra-chave `fetch`.

- **Funções Principais:**

    - Fornecer uma interface unificada e abstrata para chamadas de rede divididas por contextos bem delimitados (`dinamica`, `estatica`, `engenharia`, `materiais.usuario`).

    - Tratar as respostas HTTP, verificar o status (`response.ok`), interceptar erros de servidor (como `401 Unauthorized` ou `500 Internal Server Error`) e converter os payloads diretamente para JSON plano antes de entregar às telas.

    - Blindar o front-end contra mudanças físicas de endereços e endpoints: se a rota no Flask mudar de `/api/peso/calcular` para `/api/v2/peso/calcular`, a alteração é feita em apenas uma linha neste arquivo.

## 🎨 A Pasta UI/ (Experiência do Usuário e Telas)

#### 3. `UI/baseUI.js` (A Classe Abstrata / Contrato de Ciclo de Vida)

- **Responsabilidade:** Definir o esqueleto estrutural e o ciclo de vida obrigatório de qualquer tela principal do aplicativo. Funciona como uma classe abstrata de fábrica que implementa padrões de inversão de controle.

- **Funções Principais:**

    - Controlar o fluxo sequencial e seguro de renderização por meio do método mestre `render(container, dados)`.

    - Forçar, em tempo de execução, que todas as classes filhas implementem os métodos `template(dados)` (retorno de string HTML limpa) e `aposRenderizar(dados)` (vinculação de escutadores de eventos), disparando erros explícitos no console caso falhem.

    - Economizar linhas de código ao encapsular utilitários comuns, como o método `$(seletor)` que substitui a sintaxe verbosa de `this.container.querySelector()`.

## 📁 Subpasta UI/telas/ (As Views Principais da SPA)

#### 4. `UI/telas/catalogoUI.js` (Tela do Catálogo Online)

- **Responsabilidade:** Gerenciar a interface de busca, filtragem e listagem global de materiais de engenharia contidos no banco central (SQLite).

- **Funções Principais:**

    - Herdar os ciclos de vida de `BaseUI`.

    - Chamar o método `API.materiais.obterCatalogo()` para resgatar os dados dinâmicos da nuvem.

    - Controlar o estado dos filtros (busca por texto, categorias de materiais) e coordenar o carregamento incremental de dados (Scroll Infinito / Paginação).

    - Delegar a exibição visual para o componente especialista de grid.

#### 5. `UI/telas/inventarioUI.js` (Tela do Inventário Local / Modo Offline)

- **Responsabilidade:** Orquestrar o CRUD físico local e offline do usuário, permitindo o gerenciamento de suas pastas e arquivos JSON sem dependência ativa de internet.

- **Funções Principais:**

    - Herdar os ciclos de vida de `BaseUI`.

    - Capturar do disco local (via chamadas ao repositório local) as subpastas e arquivos para renderizar a árvore de projetos do usuário.

    - Fornecer os fluxos interativos de criar nova lista, renomear pastas, excluir materiais através do mapeamento do atributo `id_arquivo` (`NomePasta/NomeArquivo.json`).

    - Gerenciar as flags de sincronização em lote (`sincronizado: false`) para preparar a submissão para a nuvem quando a conexão for reestabelecida.

#### 6. `UI/telas/loginUI.js` (Tela de Autenticação Híbrida)

- **Responsabilidade:** Gerenciar os portões de autenticação do sistema de forma não obstrutiva.

- **Funções Principais:**

    - Herdar os ciclos de vida de `BaseUI`.

    - Coletar dados de acesso e despachar via `API.usuario.autenticar()`.

    - Destravar os botões e lógicas de sincronização em nuvem bidirecional para usuários comuns.

    - Liberar o painel administrativo restrito para você (Central de Validação), permitindo o recebimento de materiais criados pela comunidade para curadoria e mutação direta do catálogo SQLite online.

## 📁 Subpasta UI/componentes/ (Elementos Visuais Reutilizáveis)

#### 7. `UI/componentes/materiaisGrid.js` (O Renderizador de Cards Agnóstico)

- **Responsabilidade:** Um componente especializado de renderização pura e desacoplada. Ele é totalmente "burro" em relação à origem dos dados: não sabe e não se importa se os materiais vieram da nuvem via SQLite ou se foram lidos de arquivos JSON locais em um canteiro de obras offline.

- **Funções Principais:**

    - Receber um array plano de materiais estruturados e injetar iterativamente o layout HTML de cards dentro do contêiner designado.

    - Mapear e renderizar dinamicamente os badges de tags de cada material.

    - Ancorar escutadores de cliques centralizados em cada card para disparar callbacks que abrem a ficha técnica detalhada do elemento selecionado, garantindo alta performance e eliminando vazamento de memória (memory leaks).

## 🔄 Fluxo de Dependência e Dados (O Iceberg na Prática)

1. O Navegador renderiza o index e lê o `main.js`.

2. O `main.js` importa a `API` de `api.js` e as classes de `UI/telas/`.

3. Quando o usuário navega para uma seção (ex: Catálogo), `main.js` chama o método `.render()` daquela tela.

4. A tela ativa o template básico de `BaseUI`, solicita os dados à `API`, recebe o payload limpo e o entrega para o `MateriaisGrid.atualizar(dados)`.

5. O `MateriaisGrid` monta os cards físicos na tela de forma otimizada.