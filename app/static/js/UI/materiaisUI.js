export class MateriaisUI {
    constructor() {
        this.nomeMenu = "🌐 Lista On-line";
        this.materiaisCache = []; // Guarda os materiais para não precisar refazer o fetch ao filtrar
    }

    // Método principal chamado pelo roteador/maestro
    async render(containerPrincipal) {
        this.container = containerPrincipal;
        
        // 1. Renderiza a estrutura inicial (Barra de busca + Container da lista)
        this.container.innerHTML = `
            <div class="catalogo-header">
                <h2>🌐 Catálogo de Materiais On-line</h2>
                <p>Consulte propriedades de materiais e semicondutores para engenharia.</p>
                
                <div class="catalogo-search-box">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="input-busca-material" placeholder="Filtrar por nome, categoria ou tag (ex: potência)..." autocomplete="off">
                </div>
            </div>
            <div id="catalogo-lista-container" class="catalogo-grid">
                <p class="loading-text">Carregando catálogo do servidor...</p>
            </div>
        `;

        // 2. Vincula o evento de busca em tempo real
        const inputBusca = this.container.querySelector('#input-busca-material');
        inputBusca.addEventListener('input', (e) => this.filtrarLista(e.target.value));

        // 3. Busca os dados no backend
        await this.carregarDados();
    }

    async carregarDados() {
        try {
            // Simulando ou batendo na sua rota do Python que lê a pasta 'catalogo_json'
            const response = await fetch('/api/materiais/catalogo');
            this.materiaisCache = await response.json();
            
            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error("Erro ao carregar catálogo:", error);
            const listaContainer = this.container.querySelector('#catalogo-lista-container');
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Não foi possível carregar o catálogo de materiais.</p>`;
        }
    }

    exibirLista(lista) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        if (lista.length === 0) {
            listaContainer.innerHTML = `<p class="loading-text">Nenhum material encontrado com esses critérios.</p>`;
            return;
        }

        listaContainer.innerHTML = ''; // Limpa o loading

        lista.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            
            // Cria os badges de tags
            const tagsBadges = material.metadados?.tags?.map(tag => `<span class="tag-badge">${tag}</span>`).join('') || '';

            card.innerHTML = `
                <div class="material-card-info">
                    <h3>${material.nome}</h3>
                    <span class="material-categoria">${material.categoria}</span>
                    <div class="material-tags">${tagsBadges}</div>
                </div>
                <button class="btn-ver-ficha">Visualizar Ficha Técnica →</button>
            `;

            // Ao clicar em qualquer parte do card, carrega a Ficha Técnica completa
            card.addEventListener('click', () => this.renderFichaTecnica(material));

            listaContainer.appendChild(card);
        });
    }

    filtrarLista(termo) {
        const query = termo.toLowerCase().trim();
        if (!query) {
            this.exibirLista(this.materiaisCache);
            return;
        }

        const filtrados = this.materiaisCache.filter(mat => {
            const nomeMatch = mat.nome.toLowerCase().includes(query);
            const catMatch = mat.categoria.toLowerCase().includes(query);
            const tagMatch = mat.metadados?.tags?.some(tag => tag.toLowerCase().includes(query));
            return nomeMatch || catMatch || tagMatch;
        });

        this.exibirLista(filtrados);
    }

    // Segunda Forma: Apresenta todos os dados estruturados do JSON escolhido
    renderFichaTecnica(material) {
        // Altera o HTML do container principal para o modo "Ficha Técnica"
        this.container.innerHTML = `
            <div class="ficha-wrapper">
                <button id="btn-voltar-catalogo" class="btn-voltar">← Voltar ao Catálogo</button>
                
                <div class="ficha-header">
                    <div class="ficha-titulo-bloco">
                        <h2>${material.nome}</h2>
                        <span class="material-categoria grande">${material.categoria}</span>
                    </div>
                    <div class="ficha-meta">
                        <small><strong>Fonte:</strong> ${material.metadados.fonte_referencia}</small><br>
                        <small><strong>Adicionado em:</strong> ${material.metadados.data_adicao}</small>
                    </div>
                </div>

                <div class="ficha-propriedades-grid">
                    
                    <div class="propriedade-secao">
                        <h3>🔩 Propriedades Mecânicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_mecanicas)}
                        </table>
                    </div>

                    <div class="propriedade-secao">
                        <h3>🔥 Propriedades Térmicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_termicas)}
                        </table>
                    </div>

                    <div class="propriedade-secao">
                        <h3>⚡ Propriedades Elétricas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material.propriedades_eletricas)}
                        </table>
                    </div>

                </div>

                <div class="ficha-acoes">
                    <button class="table-button-submit" id="btn-salvar-inventario">
                        📥 Clonar para o Meu Inventário Personalizado
                    </button>
                </div>
            </div>
        `;

        // Ativa o botão de voltar à listagem mantendo o cache local intacto
        this.container.querySelector('#btn-voltar-catalogo').addEventListener('click', () => {
            this.render(this.container);
            this.exibirLista(this.materiaisCache); // Restaura o estado da lista imediatamente
        });

        // Gancho opcional para a sua lógica de inventário do usuário futuramente
        const btnSalvar = this.container.querySelector('#btn-salvar-inventario');
        btnSalvar.addEventListener('click', () => {
            alert(`Cópia do arquivo enviado para a pasta 'inventário_usuário' com sucesso! (ID: ${material.id})`);
        });
    }

    // Helper dinâmico para varrer os objetos do JSON e criar as tr/td automaticamente
    gerarLinhasTabela(subObjeto) {
        if (!subObjeto) return '<tr><td colspan="2">Nenhum dado disponível.</td></tr>';
        
        return Object.entries(subObjeto).map(([chave, dados]) => {
            // Formata o nome da chave substituindo underlines por espaços e capitalizando
            const nomeFormatado = chave.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
            const exibeUnidade = dados.unidade !== "adimensional" ? dados.unidade : "";
            
            return `
                <tr>
                    <td class="prop-nome">${nomeFormatado}</td>
                    <td class="prop-valor">${dados.valor} <span class="prop-unidade">${exibeUnidade}</span></td>
                </tr>
            `;
        }).join('');
    }
}