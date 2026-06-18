// Importe o objeto API mapeando o caminho correto do seu diretório
import { API } from '../api.js'; 

export class MateriaisUI {
    constructor() {
        this.nomeMenu = "🌐 Lista On-line";
        this.materiaisCache = []; 
        // Armarzenamento de estado para controle futuro do scroll infinito
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

        const inputBusca = this.container.querySelector('#input-busca-material');
        inputBusca.addEventListener('input', (e) => this.filtrarLista(e.target.value));

        await this.carregarDados();
    }

    async carregarDados() {
        try {
            // A rota agora retorna um objeto: { itens: [...], tem_mais: bool }
            const resultado = await API.materiais.obterCatalogo();
            
            this.materiaisCache = resultado.itens || [];
            this.temMaisItens = resultado.tem_mais || false;
            
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

        listaContainer.innerHTML = ''; 

        lista.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            
            // As tags agora estão direto na raiz do objeto material
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
        if (!query) {
            this.exibirLista(this.materiaisCache);
            return;
        }

        const filtrados = this.materiaisCache.filter(mat => {
            const nomeMatch = mat.nome?.toLowerCase().includes(query);
            const catMatch = mat.categoria?.toLowerCase().includes(query);
            // Tags mapeadas direto da raiz do objeto
            const tagMatch = mat.tags?.some(tag => tag.toLowerCase().includes(query));
            return nomeMatch || catMatch || tagMatch;
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
                                limite_cisalhamento: "MPa"
                            })}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>🔥 Propriedades Térmicas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material, {
                                condutividade_termica: "W/(m·K)",
                                calor_especifico: "J/(kg·K)",
                                expansao_termica: "µm/(m·K)",
                                ponto_fusao: "°C"
                            })}
                        </table>
                    </div>
                    <div class="propriedade-secao">
                        <h3>⚡ Propriedades Elétricas</h3>
                        <table class="tabela-propriedades">
                            ${this.gerarLinhasTabela(material, {
                                condutividade_eletrica: "S/m",
                                resistividade: "Ω·cm"
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
                        <h3 style="margin-top: 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 8px;">Salvar no Inventário</h3>
                        
                        <div style="margin: 16px 0;">
                            <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccc;">Escolha uma lista existente:</label>
                            <select id="select-listas-existentes" style="width: 100%; padding: 8px; background: #0f172a; color: #fff; border: 1px solid #444; border-radius: 4px;">
                                <option value="">-- Selecionar lista existente --</option>
                            </select>
                        </div>

                        <div style="margin: 16px 0;">
                            <label style="display: block; margin-bottom: 6px; font-size: 0.9rem; color: #ccc;">Ou crie uma nova lista (Nome da subpasta):</label>
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

        this.container.querySelector('#btn-voltar-catalogo').addEventListener('click', () => {
            this.render(this.container);
            this.exibirLista(this.materiaisCache);
        });

        const btnSalvar = this.container.querySelector('#btn-salvar-inventario');
        const modal = this.container.querySelector('#modal-selecionar-lista');
        const selectListas = this.container.querySelector('#select-listas-existentes');
        const inputNovaLista = this.container.querySelector('#input-nova-lista');
        
        btnSalvar.addEventListener('click', async () => {
            modal.style.display = 'flex';
            
            try {
                const listas = await API.materiais.usuario.obterListas();
                
                selectListas.innerHTML = '<option value="">-- Selecionar lista existente --</option>';
                listas.forEach(nomePasta => {
                    const opt = document.createElement('option');
                    opt.value = nomePasta;
                    opt.textContent = nomePasta;
                    selectListas.appendChild(opt);
                });
            } catch (err) {
                console.error("Erro ao ler pastas do inventário:", err);
            }
        });

        this.container.querySelector('#btn-cancelar-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            inputNovaLista.value = '';
        });

        this.container.querySelector('#btn-confirmar-modal').addEventListener('click', async () => {
            let listaDestino = selectListas.value;
            const novaLista = inputNovaLista.value.trim();

            if (novaLista) {
                listaDestino = novaLista;
            }

            if (!listaDestino) {
                alert("Por favor, selecione uma lista existente ou digite o nome de uma nova lista.");
                return;
            }

            const payload = {
                nome_lista: listaDestino,
                material: material
            };

            try {
                const resultado = await API.materiais.usuario.adicionar(payload);

                if (resultado.sucesso) {
                    alert(resultado.mensagem);
                    modal.style.display = 'none';
                    inputNovaLista.value = '';
                } else {
                    alert(`Erro do sistema: ${resultado.erro}`);
                }
            } catch (error) {
                alert("Falha de rede ao tentar salvar o material no repositório local.");
                console.error(error);
            }
        });
    }

    // Método reformulado para realizar o agrupamento e mapeamento cosmético no Client-side
    gerarLinhasTabela(material, mapaPropriedades) {
        const linhasHTML = Object.entries(mapaPropriedades).map(([coluna, unidade]) => {
            const valor = material[coluna];
            
            // Ignora a linha se a propriedade não existir ou for nula para aquele material
            if (valor === undefined || valor === null) return '';
            
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

        // Fallback de segurança caso a secessão inteira esteja vazia
        if (!linhasHTML) {
            return '<tr><td colspan="2" style="color: #666; font-style: italic; padding: 8px;">Nenhum dado disponível.</td></tr>';
        }
        
        return linhasHTML;
    }
}