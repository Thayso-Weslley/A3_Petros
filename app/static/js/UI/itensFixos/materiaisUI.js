// app/static/js/UI/itensFixos/materiaisUI.js
//
// Tela de CONSULTA do catálogo público de materiais.
// Responsabilidade única: listar/filtrar o catálogo on-line,
// mostrar a ficha técnica (somente leitura) e permitir clonar
// um material para uma lista do usuário.
//
// Herda de BaseCatalogoUI apenas os componentes visuais sem estado
// (esqueleto de tela, card, ficha técnica, botão, modal). A lógica
// de navegação/estado é toda própria desta classe.

import { API } from '../../api.js';
import { BaseCatalogoUI } from '../abstrata/baseCatalogoUI.js';

export class MateriaisUI extends BaseCatalogoUI {
    constructor() {
        super();
        this.nomeMenu = "🌐 Lista On-line";
        this.materiaisCache = [];
        this.paginaAtual = 1;
        this.temMaisItens = false;
    }

    async render(containerPrincipal) {
        this.container = containerPrincipal;

        this.container.innerHTML = this.renderEsqueleto({
            titulo: "🌐 Catálogo de Materiais On-line",
            subtitulo: "Consulte propriedades de materiais e semicondutores para engenharia.",
            placeholderBusca: "Filtrar por nome, categoria ou tag...",
        });

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
        this.renderGridMateriais(
            listaContainer,
            lista,
            "Nenhum material encontrado com esses critérios.",
            (material) => this.renderFichaTecnica(material)
        );
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
        const botaoClonar = this.criarBotao({
            id: 'btn-salvar-inventario',
            texto: '📥 Clonar para o Meu Inventário Personalizado',
            variante: 'submit',
        });

        const modalSalvar = this.criarModal({
            id: 'modal-selecionar-lista',
            titulo: 'Salvar no Inventário',
            conteudoHTML: `
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
            `,
            botoes: [
                { id: 'btn-cancelar-modal', texto: 'Cancelar', variante: 'neutro' },
                { id: 'btn-confirmar-modal', texto: 'Confirmar Salvação', variante: 'confirmar' },
            ],
        });

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

                ${this.renderGridPropriedades(material)}

                ${this.renderBlocoAcoes(botaoClonar)}

                ${modalSalvar}
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
}