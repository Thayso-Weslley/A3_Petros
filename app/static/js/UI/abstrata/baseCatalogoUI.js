// app/static/js/UI/itensFixos/baseCatalogoUI.js
//
// Classe ABSTRATA. Não pode ser instanciada diretamente (ver constructor).
// Reúne tudo que é estrutural/visual e é IDÊNTICO entre as telas do
// catálogo público (MateriaisUI) e do inventário do usuário (ListasUsuarioUI):
//
//   - esqueleto da tela (header com busca + grid)
//   - card de material
//   - tabelas de propriedades (ficha técnica)
//   - geradores de botão e de modal genéricos
//
// O que NÃO está aqui, de propósito: render(), abrirPasta(), e qualquer
// método que represente o FLUXO da tela. Cada subclasse tem sua própria
// lógica de navegação/estado — só a "matéria-prima" visual é herdada.
// Isso evita o problema da tentativa anterior (ListasUsuarioUI extends
// MateriaisUI), onde a subclasse herdava comportamento de tela que não
// fazia sentido para o caso de uso dela.

export class BaseCatalogoUI {
    constructor() {
        if (this.constructor === BaseCatalogoUI) {
            throw new Error('BaseCatalogoUI é abstrata: não pode ser instanciada diretamente, apenas herdada.');
        }

        // Mapas de propriedades -> unidade, usados pela ficha técnica.
        // Ficam centralizados aqui porque as duas telas devem mudar juntas.
        this.MAPAS_PROPRIEDADES = {
            mecanicas: {
                densidade: "g/cm³",
                modulo_elasticidade: "GPa",
                coeficiente_poisson: "adimensional",
                limite_compressao: "MPa",
                limite_tracao: "MPa",
                limite_cisalhamento: "MPa",
            },
            termicas: {
                calor_especifico: "J/(g·K)",
                condutividade_termica: "W/(m·K)",
                expansao_termica: "µm/(m·K)",
                ponto_fusao: "°C",
            },
            eletricas: {
                condutividade_eletrica: "S/m",
                resistividade: "Ω·m",
            },
        };

        // Estilos inline centralizados por variante de botão.
        // 'submit' não tem estilo inline porque usa a classe CSS global
        // .table-button-submit já existente no projeto.
        this.ESTILOS_BOTAO = {
            // 'submit' e 'nenhum' não levam estilo inline: 'submit' usa a
            // classe CSS global .table-button-submit; 'nenhum' é para
            // quando o botão só precisa de uma classe própria (ex: .btn-ver-ficha)
            // sem nenhum estilo adicional vindo daqui.
            submit: '',
            nenhum: '',
            confirmar: 'background: #2baf4a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;',
            perigo: 'background: #d9534f; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;',
            neutro: 'background: #444; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;',
        };
    }

    // ==========================================
    // ESQUELETO DA TELA (header com busca + grid)
    // ==========================================

    /**
     * Monta o esqueleto padrão da tela: header (título, subtítulo,
     * campo de busca sempre presente) + container do grid.
     * O campo de busca tem SEMPRE o mesmo id (#input-busca-material),
     * então o mesmo listener de filtro funciona em qualquer tela.
     *
     * @param {object} opcoes
     * @param {string} opcoes.titulo - HTML do <h2>
     * @param {string} opcoes.subtitulo - HTML do <p>
     * @param {string} opcoes.placeholderBusca - texto do input de busca
     * @param {string} [opcoes.acoesExtras] - HTML extra (ex: botão "Nova Lista")
     * @returns {string} HTML do esqueleto
     */
    renderEsqueleto({ titulo, subtitulo, placeholderBusca, acoesExtras = '' }) {
        return `
            <div class="catalogo-header">
                <h2>${titulo}</h2>
                <p>${subtitulo}</p>
                ${acoesExtras}
                <div class="catalogo-search-box">
                    <span class="search-icon">🔎</span>
                    <input type="text" id="input-busca-material" placeholder="${placeholderBusca}" autocomplete="off">
                </div>
            </div>
            <div id="catalogo-lista-container" class="catalogo-grid">
                <p class="loading-text">Carregando...</p>
            </div>
        `;
    }

    // ==========================================
    // CARD DE MATERIAL E GRID
    // ==========================================

    /** HTML interno de um card de material (sem o wrapper <div>). */
    renderConteudoCardMaterial(material) {
        const tagsBadges = material.tags?.map(tag => `<span class="tag-badge">${tag}</span>`).join('') || '';

        return `
            <div class="material-card-info">
                <h3>${material.nome}</h3>
                <span class="material-categoria">${material.categoria}</span>
                <div class="material-tags">${tagsBadges}</div>
            </div>
            <button class="btn-ver-ficha">Visualizar Ficha Técnica →</button>
        `;
    }

    /** 
     * Renderiza a grade de materiais dentro do container já existente
     * na tela, incluindo o estado vazio.
     * @param {HTMLElement} listaContainer
     * @param {object[]} lista
     * @param {string} mensagemVazia
     * @param {(material: object) => void} onClickCard
     */
    renderGridMateriais(listaContainer, lista, mensagemVazia, onClickCard) {
        if (!lista.length) {
            listaContainer.innerHTML = `<p class="loading-text">${mensagemVazia}</p>`;
            return;
        }

        listaContainer.innerHTML = '';

        lista.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.innerHTML = this.renderConteudoCardMaterial(material);
            card.addEventListener('click', () => onClickCard(material));
            listaContainer.appendChild(card);
        });
    }

    // ==========================================
    // FICHA TÉCNICA (tabelas de propriedades)
    // ==========================================

    /** Gera as linhas <tr> de uma tabela de propriedades. */
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

    /** Gera o HTML completo do bloco de 3 tabelas (Mecânicas/Térmicas/Elétricas). */
    renderGridPropriedades(material) {
        return `
            <div class="ficha-propriedades-grid">
                <div class="propriedade-secao">
                    <h3>🔩 Propriedades Mecânicas</h3>
                    <table class="tabela-propriedades">
                        ${this.gerarLinhasTabela(material, this.MAPAS_PROPRIEDADES.mecanicas)}
                    </table>
                </div>
                <div class="propriedade-secao">
                    <h3>🔥 Propriedades Térmicas</h3>
                    <table class="tabela-propriedades">
                        ${this.gerarLinhasTabela(material, this.MAPAS_PROPRIEDADES.termicas)}
                    </table>
                </div>
                <div class="propriedade-secao">
                    <h3>⚡ Propriedades Elétricas</h3>
                    <table class="tabela-propriedades">
                        ${this.gerarLinhasTabela(material, this.MAPAS_PROPRIEDADES.eletricas)}
                    </table>
                </div>
            </div>
        `;
    }

    // ==========================================
    // COMPONENTES GENÉRICOS: botão, bloco de ações, modal
    // ==========================================

    /**
     * Gera o HTML de um botão padronizado.
     * @param {object} opcoes
     * @param {string} opcoes.id
     * @param {string} opcoes.texto
     * @param {'submit'|'confirmar'|'perigo'|'neutro'} [opcoes.variante='neutro']
     * @param {string} [opcoes.classeExtra]
     * @returns {string}
     */
    criarBotao({ id, texto, variante = 'neutro', classeExtra = '' }) {
        const estiloInline = this.ESTILOS_BOTAO[variante] ?? this.ESTILOS_BOTAO.neutro;
        const classeCSS = variante === 'submit'
            ? `table-button-submit ${classeExtra}`.trim()
            : classeExtra;

        const atributoStyle = estiloInline ? ` style="${estiloInline}"` : '';
        const atributoClasse = classeCSS ? ` class="${classeCSS}"` : '';
        const atributoId = id ? ` id="${id}"` : '';

        return `<button${atributoId}${atributoClasse}${atributoStyle}>${texto}</button>`;
    }

    /**
     * Envolve uma lista de botões (HTML já pronto) no container
     * padrão de "ações da ficha" (flex, gap, wrap).
     * @param {...string} botoesHTML
     */
    renderBlocoAcoes(...botoesHTML) {
        return `<div class="ficha-acoes" style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">${botoesHTML.join('')}</div>`;
    }

    /**
     * Gera o HTML de um modal genérico (overlay + caixa central).
     * O modal nasce com display:none; quem o exibe é a tela, via JS.
     * @param {object} opcoes
     * @param {string} opcoes.id - id do overlay (usado para abrir/fechar)
     * @param {string} opcoes.titulo
     * @param {string} opcoes.conteudoHTML - corpo do modal (forms, labels, etc.)
     * @param {{id: string, texto: string, variante?: string}[]} opcoes.botoes - botões do rodapé
     * @returns {string}
     */
    criarModal({ id, titulo, conteudoHTML, botoes }) {
        const botoesHTML = botoes.map(b => this.criarBotao(b)).join('');

        return `
            <div id="${id}" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999; justify-content: center; align-items: center;">
                <div style="background: #1a2436; padding: 24px; border-radius: 8px; width: 90%; max-width: 450px; border: 1px solid #0275d8; color: #fff;">
                    <h3 style="margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 8px;">${titulo}</h3>
                    ${conteudoHTML}
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
                        ${botoesHTML}
                    </div>
                </div>
            </div>
        `;
    }
}