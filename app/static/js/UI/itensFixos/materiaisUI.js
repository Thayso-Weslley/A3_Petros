// app/static/js/UI/itensFixos/materiaisUI.js
import { API } from '../../api.js'; 

export class MateriaisUI {
    constructor() {
        this.nomeMenu = "🌐 Lista On-line";
        this.materiaisCache = []; 
        this.paginaAtual = 1;
        this.temMaisItens = false;
    }

    async render(containerPrincipal) {
        this.container = containerPrincipal;
        
        this.container.innerHTML = `
            <div class="catalogo-header">
                <h2>🌐 Catálogo de Materiais On-line</h2>
                <p>Consulte propriedades de materiais e semicondutores para engenharia.</p>
                <div class="catalogo-search-box">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="input-busca-material" placeholder="Filtrar por nome, categoria ou tag..." autocomplete="off">
                </div>
            </div>
            <div id="catalogo-lista-container" class="catalogo-grid">
                <p class="loading-text">Carregando catálogo do servidor...</p>
            </div>
        `;

        this.container.querySelector('#input-busca-material')
            .addEventListener('input', (e) => this.filtrarLista(e.target.value));

        await this.carregarDados();
    }

    async carregarDados() {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        try {
            const resultado = await API.materiais.obterCatalogo();
            this.materiaisCache = resultado.itens || [];
            this.temMaisItens = resultado.tem_mais || false;
            
            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error("Erro ao carregar catálogo:", error);
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Não foi possível carregar o catálogo de materiais.</p>`;
        }
    }

    exibirLista(lista) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        
        if (!lista.length) {
            listaContainer.innerHTML = `<p class="loading-text">Nenhum material encontrado com esses critérios.</p>`;
            return;
        }

        listaContainer.innerHTML = ''; 

        lista.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            
            const tagsBadges = material.tags?.map(tag => `<span class="tag-badge">${tag}</span>`).join('') || '';

            card.innerHTML = `
                <div class="material-card-info">
                    <h3>${material.nome}</h3>
                    <span class="material-categoria">${material.categoria}</span>
                    <div class="material-tags">${tagsBadges}</div>
                </div>
                <button class="btn-ver-ficha">Visualizar Ficha Técnica →</button>
            `;

            card.addEventListener('click', () => this.renderFichaTecnica(material));
            listaContainer.appendChild(card);
        });
    }

    filtrarLista(termo) {
        const query = termo.toLowerCase().trim();
        if (!query) return this.exibirLista(this.materiaisCache);

        const filtrados = this.materiaisCache.filter(mat => {
            return mat.nome?.toLowerCase().includes(query) ||
                   mat.categoria?.toLowerCase().includes(query) ||
                   mat.tags?.some(tag => tag.toLowerCase().includes(query));
        });

        this.exibirLista(filtrados);
    }

    renderFichaTecnica(material) {
        this.container.innerHTML = `
            <div class="ficha-wrapper" style="position: relative;">
                <button id="btn-voltar-catalogo" class="btn-voltar">← Voltar ao Catálogo</button>
                
                <div class="ficha-header">
                    <div class="ficha-titulo-bloco">
                        <h2>${material.nome}</h2>
                        <span class="material-categoria grande">${material.categoria}</span>
                    </div>
                    <div class="ficha-meta">
                        <small><strong>Fonte:</strong> ${material.fonte_referencia || 'N/A'}</small><br>
                        <small><strong>Adicionado em:</strong> ${material.data_adicao || 'N/A'}</small>
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

                <div class="ficha-acoes">
                    <button class="table-button-submit" id="btn-salvar-inventario">
                        📥 Clonar para o Meu Inventário Personalizado
                    </button>
                </div>

                <div id="modal-selecionar-lista" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999; justify-content: center; align-items: center;">
                    <div style="background: #1a2436; padding: 24px; border-radius: 8px; width: 90%; max-width: 450px; border: 1px solid #0275d8; color: #fff;">
                        <h3 style="margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 8px;">Salvar no Inventário</h3>
                        <div style="margin: 16px 0;">
                            <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccc;">Escolha uma lista existente:</label>
                            <select id="select-listas-existentes" style="width: 100%; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                                <option value="">-- Selecionar lista existente --</option>
                            </select>
                        </div>
                        <div style="margin: 16px 0;">
                            <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccc;">Ou crie uma nova lista:</label>
                            <input type="text" id="input-nova-lista" placeholder="Ex: Projeto TCC Semicondutores" style="width: 95%; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
                            <button id="btn-cancelar-modal" style="background: #444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancelar</button>
                            <button id="btn-confirmar-modal" style="background: #2baf4a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Confirmar Salvação</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.configurarEventosFichaTecnica(material);
    }

    configurarEventosFichaTecnica(material) {
        this.container.querySelector('#btn-voltar-catalogo').addEventListener('click', () => {
            this.render(this.container);
        });

        const modal = this.container.querySelector('#modal-selecionar-lista');
        const selectListas = this.container.querySelector('#select-listas-existentes');
        const inputNovaLista = this.container.querySelector('#input-nova-lista');

        this.container.querySelector('#btn-salvar-inventario').addEventListener('click', async () => {
            modal.style.display = 'flex';
            try {
                const listas = await API.materiais.usuario.obterListas();
                selectListas.innerHTML = '<option value="">-- Selecionar lista existente --</option>';
                
                if (listas && listas.length > 0) {
                    listas.forEach(nomePasta => {
                        selectListas.appendChild(new Option(nomePasta, nomePasta));
                    });
                }
            } catch (err) {
                console.error("Erro ao ler pastas:", err);
            }
        });

        // Helper para limpar e fechar o modal de forma padronizada
        const fecharModal = () => {
            modal.style.display = 'none';
            inputNovaLista.value = '';
            selectListas.value = ''; // 💡 UX: Reseta o select também para a próxima abertura
        };

        this.container.querySelector('#btn-cancelar-modal').addEventListener('click', fecharModal);

        this.container.querySelector('#btn-confirmar-modal').addEventListener('click', async () => {
            const listaDestino = inputNovaLista.value.trim() || selectListas.value;

            if (!listaDestino) {
                alert("Por favor, selecione ou digite o nome de uma lista.");
                return;
            }

            try {
                const resultado = await API.materiais.usuario.adicionar(listaDestino, material);
                
                if (resultado.sucesso) {
                    alert(resultado.mensagem || "Material salvo com sucesso!");
                    fecharModal();
                } else {
                    alert(`Erro: ${resultado.erro}`);
                }
            } catch (error) {
                alert("Falha de rede ao tentar salvar o material.");
                console.error(error);
            }
        });
    }

    gerarLinhasTabela(material, mapaPropriedades) {
        const linhasHTML = Object.entries(mapaPropriedades).map(([coluna, unidade]) => {
            const valor = material[coluna];
            if (valor == null || valor === '') return ''; 
            
            const nomeFormatado = coluna.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
            const exibeUnidade = unidade !== "adimensional" ? unidade : "";
            
            return `
                <tr>
                    <td class="prop-nome" style="padding: 8px; color: #aaa;">${nomeFormatado}</td>
                    <td class="prop-valor" style="padding: 8px; color: #fff; font-weight: bold; text-align: right;">
                        ${valor} <span class="prop-unidade" style="color: #0275d8; font-size: 0.85rem; margin-left: 4px;">${exibeUnidade}</span>
                    </td>
                </tr>
            `;
        }).join('');

        return linhasHTML || '<tr><td colspan="2" style="color: #666; font-style: italic; padding: 8px;">Nenhum dado disponível.</td></tr>';
    }
}