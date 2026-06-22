import { MateriaisUI } from './materiaisUI.js';
import { API } from '../../api.js';

export class ListasUsuarioUI extends MateriaisUI {
    constructor() {
        super();
        this.nomeMenu = "📁 Meus Inventários";
        this.tituloSecao = "📁 Meus Inventários Privados";
        this.subtituloSecao = "Selecione uma pasta para gerenciar seus materiais e semicondutores.";
        
        // Estado extra para controlar em qual pasta o usuário está navegando
        this.pastaAberta = null; 
    }

    // 1. Altera a renderização inicial para focar nas PASTAS, ocultando o input de busca geral
    async render(containerPrincipal) {
        this.container = containerPrincipal;
        this.pastaAberta = null; // Reseta o estado ao voltar para a raiz

        this.container.innerHTML = `
            <div class="catalogo-header">
                <h2>${this.tituloSecao}</h2>
                <p>${this.subtituloSecao}</p>
                <div class="catalogo-search-box" id="wrapper-busca-privada" style="display: none;">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="input-busca-material" placeholder="Buscar materiais nesta pasta..." autocomplete="off">
                </div>
            </div>
            <div id="catalogo-lista-container" class="catalogo-grid">
                <p class="loading-text">Carregando pastas do seu inventário...</p>
            </div>
        `;

        // Carrega as pastas primeiro
        await this.carregarPastas();
    }

    // 2. Novo método para buscar e exibir as pastas criadas pelo usuário
    async carregarPastas() {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        try {
            const listas = await API.materiais.usuario.obterListas();
            
            if (!listas || listas.length === 0) {
                listaContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
                        <p>Você ainda não possui pastas ou listas criadas.</p>
                        <small>Vá ao Catálogo On-line e clone um material para iniciar seu inventário!</small>
                    </div>
                `;
                return;
            }

            listaContainer.innerHTML = '';

            listas.forEach(nomePasta => {
                const pastaCard = document.createElement('div');
                pastaCard.className = 'material-card pasta-card'; // Você pode estilizar .pasta-card no CSS com uma borda amarela/azul
                pastaCard.style.borderLeft = '4px solid #f0ad4e'; // Destaque visual de pasta
                
                pastaCard.innerHTML = `
                    <div class="material-card-info" style="cursor: pointer;">
                        <h3>📁 ${nomePasta}</h3>
                        <span class="material-categoria">Pasta de Projetos</span>
                    </div>
                    <button class="btn-ver-ficha" style="background: #f0ad4e;">Abrir Pasta →</button>
                `;

                // Ao clicar na pasta, buscamos os materiais contidos nela
                pastaCard.addEventListener('click', () => this.abrirPasta(nomePasta));
                listaContainer.appendChild(pastaCard);
            });

        } catch (error) {
            console.error("Erro ao carregar pastas do usuário:", error);
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Não foi possível carregar suas pastas.</p>`;
        }
    }

    // 3. Modifica o fluxo para puxar os materiais APENAS da pasta selecionada
    async abrirPasta(nomePasta) {
        this.pastaAberta = nomePasta;
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        const buscaWrapper = this.container.querySelector('#wrapper-busca-privada');
        
        // Atualiza textos da tela para contextualizar o usuário
        this.container.querySelector('.catalogo-header h2').innerText = `📁 Pasta: ${nomePasta}`;
        this.container.querySelector('.catalogo-header p').innerHTML = `
            <button id="btn-voltar-raiz" style="background: #444; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px;">← Voltar para Pastas</button>
            Visualizando materiais salvos nesta pasta.
        `;

        // Ativa o botão de voltar para a raiz de pastas
        this.container.querySelector('#btn-voltar-raiz').addEventListener('click', () => this.render(this.container));

        // Mostra e configura a barra de pesquisa exclusiva para os itens dessa pasta
        buscaWrapper.style.display = 'block';
        const inputBusca = this.container.querySelector('#input-busca-material');
        inputBusca.value = '';
        inputBusca.replaceWith(inputBusca.cloneNode(true)); // Limpa listeners antigos de outras pastas
        this.container.querySelector('#input-busca-material')
            .addEventListener('input', (e) => this.filtrarLista(e.target.value));

        listaContainer.innerHTML = '<p class="loading-text">Buscando materiais da pasta...</p>';

        try {
            // Usa o método da API que filtra por pasta
            const resultado = await API.materiais.usuario.obterMateriaisDaLista(nomePasta);
            this.materiaisCache = resultado.itens || resultado || [];
            
            // Invoca o método herdado de materiaisUI que renderiza o grid perfeitamente
            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error(`Erro ao carregar materiais da lista ${nomePasta}:`, error);
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Erro ao carregar os materiais desta pasta.</p>`;
        }
    }

    // 4. Sobrescreve a Ficha Técnica para manter o escopo da pasta ativa ao voltar
    renderFichaTecnica(material) {
        this.container.innerHTML = `
            <div class="ficha-wrapper" style="position: relative;">
                <button id="btn-voltar-pasta" class="btn-voltar">← Voltar para a Pasta (${this.pastaAberta})</button>
                
                <div class="ficha-header">
                    <div class="ficha-titulo-bloco">
                        <h2>${material.nome}</h2>
                        <span class="material-categoria grande">${material.categoria}</span>
                    </div>
                    <div class="ficha-meta">
                        <small><strong>Pasta/Lista:</strong> ${this.pastaAberta}</small><br>
                        <small><strong>Fonte ID:</strong> ${material.id || 'N/A'}</small>
                    </div>
                </div>

                <div class="ficha-propriedades-grid">
                    <div class="propriedade-secao">
                        <h3>🔩 Propriedades Mecânicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material, {
                                densidade: "g/cm³", 
                                modulo_elasticidade: "GPa",
                                coeficiente_poisson: "adimensional",
                                limite_compressao: "MPa",
                                limite_tracao: "MPa",
                                limite_cisalhamento: "MPa",
                            })}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>🔥 Propriedades Térmicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material, {
                                calor_especifico: "J/(g·K)",
                                condutividade_termica: "W/(m·K)", 
                                expansao_termica: "µm/(m·K)",
                                ponto_fusao: "°C",
                            })}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>⚡ Propriedades Elétricas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material, {
                                condutividade_eletrica: "S/m",
                                resistividade: "Ω·m",
                            })}
                        </table>
                    </div>
                </div>

                <div class="ficha-acoes" style="display: flex; gap: 12px; margin-top: 20px;">
                    <button class="table-button-danger" id="btn-remover-inventario" style="background: #d9534f; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        🗑️ Remover desta Pasta
                    </button>
                </div>
            </div>
        `;

        this.configurarEventosFichaPrivada(material);
    }

    // 5. Configura as ações garantindo o retorno para a pasta correta e o DELETE correto
    configurarEventosFichaPrivada(material) {
        // Ao clicar em voltar dentro da ficha, ele retorna para a pasta aberta, não para a raiz do app
        this.container.querySelector('#btn-voltar-pasta').addEventListener('click', () => {
            this.abrirPasta(this.pastaAberta);
        });

        this.container.querySelector('#btn-remover-inventario').addEventListener('click', async () => {
            if (!confirm(`Tem certeza que deseja remover ${material.nome} da pasta "${this.pastaAberta}"?`)) return;

            try {
                const idOuNome = material.id || material.nome;

                // Passa a pasta correta controlada pelo estado da classe
                const resultado = await API.materiais.usuario.deletarMaterial(this.pastaAberta, idOuNome);
                
                if (resultado.sucesso || !resultado.erro) {
                    alert("Material removido com sucesso!");
                    // Atualiza abrindo a mesma pasta para ver as alterações refletidas
                    this.abrirPasta(this.pastaAberta); 
                } else {
                    alert(`Erro ao remover: ${resultado.erro}`);
                }
            } catch (error) {
                alert("Erro de comunicação com o servidor.");
                console.error(error);
            }
        });
    }
}