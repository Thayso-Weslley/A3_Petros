// app/static/js/UI/itensFixos/listasUsuarioUI.js
//
// Tela de CRUD do inventário PESSOAL do usuário:
// - listar pastas, criar pasta, renomear pasta, excluir pasta
// - filtrar pastas (na raiz) ou materiais (dentro de uma pasta) pela mesma busca
// - abrir pasta e ver materiais salvos
// - ver ficha técnica do material (somente leitura, igual ao catálogo)
// - remover material da pasta
// - compartilhar material com o catálogo central (crowdsourcing)
//
// Herda de BaseCatalogoUI apenas os componentes visuais sem estado
// (esqueleto de tela, card, ficha técnica, botão). A lógica de
// navegação/estado (pastas, pasta aberta) é toda própria desta classe.

import { BaseCatalogoUI } from '../abstrata/baseCatalogoUI.js';

export class ListasUsuarioUI extends BaseCatalogoUI {
    constructor(ApiDoUsuario) {
        super();
        this.api = ApiDoUsuario;
        this.nomeMenu = "📁 Meus Inventários";
        this.tituloSecao = "📁 Meus Inventários Privados";
        this.subtituloSecao = "Selecione uma pasta para gerenciar seus materiais e semicondutores.";

        this.pastasCache = [];
        this.materiaisCache = [];
        this.materiaisCachePorPasta = {};
        // Estado de navegação: null = está na raiz vendo as pastas; string = está dentro dessa pasta
        this.pastaAberta = null;
    }

    // ==========================================
    // RAIZ: lista de pastas
    // ==========================================

    async render(containerPrincipal) {
        this.container = containerPrincipal;
        this.pastaAberta = null; // Reseta o estado ao voltar para a raiz

        const botaoNovaLista = this.criarBotao({
            id: 'btn-nova-lista',
            texto: '➕ Nova Lista',
            variante: 'submit',
        });

        this.container.innerHTML = this.renderEsqueleto({
            titulo: this.tituloSecao,
            subtitulo: this.subtituloSecao,
            placeholderBusca: "Filtrar pastas por nome...",
            acoesExtras: `<div class="catalogo-acoes-topo" style="display: flex; gap: 10px; margin: 12px 0;">${botaoNovaLista}</div>`,
        });

        this.container.querySelector('#input-busca-material')
            .addEventListener('input', (e) => this.filtrarPastas(e.target.value));

        this.container.querySelector('#btn-nova-lista')
            .addEventListener('click', () => this.criarNovaLista());

        await this.carregarPastas();
    }

    async carregarPastas() {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        try {   
            const listas = await this.api.obterListas();
            this.pastasCache = listas || [];

            this.exibirPastas(this.pastasCache);
        } catch (error) {
            console.error("Erro ao carregar pastas do usuário:", error);
            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Não foi possível carregar suas pastas.</p>`;
        }
    }

    exibirPastas(listaDePastas) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');

        if (!listaDePastas || listaDePastas.length === 0) {
            listaContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
                    <p>Você ainda não possui pastas ou listas criadas.</p>
                    <small>Clique em "➕ Nova Lista" ou vá ao Catálogo On-line e clone um material para iniciar seu inventário!</small>
                </div>
            `;
            return;
        }

        listaContainer.innerHTML = '';

        listaDePastas.forEach(nomePasta => {
            // Refatoração: Botões de ação agora são apenas ícones menores e usam a nova classe CSS
            const botaoRenomear = this.criarBotao({ id: '', texto: '✏️', variante: 'neutro', classeExtra: 'btn-icon-pasta btn-renomear-pasta' });
            const botaoExcluir = this.criarBotao({ id: '', texto: '🗑️', variante: 'perigo', classeExtra: 'btn-icon-pasta btn-excluir-pasta' });
            // O botão de abrir continua no fluxo normal do card.
            const botaoAbrir = this.criarBotao({ id: '', texto: 'Abrir Pasta →', variante: 'nenhum', classeExtra: 'btn-ver-ficha btn-abrir-pasta' });

            const pastaCard = document.createElement('div');
            // A classe 'pasta-card' é usada como gancho no CSS
            pastaCard.className = 'material-card pasta-card';
            pastaCard.style.borderLeft = '4px solid #f0ad4e';

            // Nova Estrutura HTML: Ações em container absoluto no canto superior direito
            pastaCard.innerHTML = `
                <div class="card-actions-container">
                    ${botaoRenomear}
                    ${botaoExcluir}
                </div>
                
                <div class="material-card-info" style="cursor: pointer;">
                    <h3>📁 ${nomePasta}</h3>
                    <span class="material-categoria">Pasta de Projetos</span>
                </div>
                
                <!-- O botão de abrir permanece na base, fora do container absoluto -->
                <div>
                    ${botaoAbrir}
                </div>
            `;

            // Event listeners (permanecem os mesmos)
            pastaCard.querySelector('.btn-abrir-pasta')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.abrirPasta(nomePasta);
                });

            pastaCard.querySelector('.btn-renomear-pasta')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.renomearLista(nomePasta);
                });

            pastaCard.querySelector('.btn-excluir-pasta')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.excluirLista(nomePasta);
                });

            // Clique no card abre a pasta
            pastaCard.addEventListener('click', () => this.abrirPasta(nomePasta));

            listaContainer.appendChild(pastaCard);
        });
    }

    filtrarPastas(termo) {
        const query = termo.toLowerCase().trim();
        if (!query) return this.exibirPastas(this.pastasCache);

        const filtradas = this.pastasCache.filter(nomePasta =>
            nomePasta.toLowerCase().includes(query)
        );

        this.exibirPastas(filtradas);
    }

    async criarNovaLista() {
        const nome = prompt("Nome da nova lista:");
        const nomeLimpo = nome?.trim();
        if (!nomeLimpo) return;

        try {
            const resultado = await this.api.criarLista(nomeLimpo);
            if (resultado.sucesso || !resultado.erro) {
                await this.carregarPastas();
            } else {
                alert(`Erro ao criar lista: ${resultado.erro}`);
            }
        } catch (error) {
            alert("Erro de comunicação com o servidor ao criar a lista.");
            console.error(error);
        }
    }

    async renomearLista(nomeAntigo) {
        const nomeNovo = prompt(`Novo nome para a lista "${nomeAntigo}":`, nomeAntigo);
        const nomeLimpo = nomeNovo?.trim();
        if (!nomeLimpo || nomeLimpo === nomeAntigo) return;

        try {
            const resultado = await this.api.renomearLista(nomeAntigo, nomeLimpo);
            if (resultado.sucesso || !resultado.erro) {
                await this.carregarPastas();
            } else {
                alert(`Erro ao renomear: ${resultado.erro}`);
            }
        } catch (error) {
            alert("Erro de comunicação com o servidor ao renomear a lista.");
            console.error(error);
        }
    }

    async excluirLista(nomeLista) {
        if (!confirm(`Tem certeza que deseja excluir a lista "${nomeLista}" e todos os vínculos com seus materiais? Esta ação não pode ser desfeita.`)) return;

        try {
            const resultado = await this.api.deletarLista(nomeLista);
            if (resultado.sucesso || !resultado.erro) {
                await this.carregarPastas();
            } else {
                alert(`Erro ao excluir: ${resultado.erro}`);
            }
        } catch (error) {
            alert("Erro de comunicação com o servidor ao excluir a lista.");
            console.error(error);
        }
    }

    // ==========================================
    // DENTRO DE UMA PASTA: materiais salvos
    // ==========================================

    async abrirPasta(nomePasta) {
        this.pastaAberta = nomePasta;

        const botaoVoltarRaiz = this.criarBotao({
            id: 'btn-voltar-raiz',
            texto: '← Voltar para Pastas',
            variante: 'neutro',
        });

        // Sempre reconstrói o esqueleto completo (header + busca + grid).
        // Isso garante que o campo de busca SEMPRE existe aqui, não importa
        // se viemos da raiz ou da ficha técnica de um material.
        this.container.innerHTML = this.renderEsqueleto({
            titulo: `📁 Pasta: ${nomePasta}`,
            subtitulo: `${botaoVoltarRaiz} Visualizando materiais salvos nesta pasta.`,
            placeholderBusca: "Buscar materiais nesta pasta...",
        });


        const listaContainer = this.container.querySelector('#catalogo-lista-container');

        this.container.querySelector('#btn-voltar-raiz')
            .addEventListener('click', () => this.render(this.container));

        this.container.querySelector('#input-busca-material')
            .addEventListener('input', (e) => this.filtrarLista(e.target.value));

        listaContainer.innerHTML = '<p class="loading-text">Buscando materiais da pasta...</p>';

        try {
            const resultado = await this.api.obterMateriaisDaLista(nomePasta);
            this.materiaisCache = resultado.itens || resultado || [];
            this.materiaisCachePorPasta[nomePasta] = this.materiaisCache;

            this.exibirLista(this.materiaisCache);
        } catch (error) {
            console.error(`Erro ao carregar materiais da lista ${nomePasta}:`, error);

            const cached = this.materiaisCachePorPasta[nomePasta];
            if (cached && cached.length > 0) {
                this.materiaisCache = cached;
                this.exibirLista(this.materiaisCache);
                return;
            }

            listaContainer.innerHTML = `<p style="color: #ff4d4d;">Erro ao carregar os materiais desta pasta.</p>`;
        }
    }

    exibirLista(lista) {
        const listaContainer = this.container.querySelector('#catalogo-lista-container');
        
        // 1. Chama a renderização padrão (que agora vai usar o nosso método sobrescrito acima)
        this.renderGridMateriais(
            listaContainer,
            lista,
            "Nenhum material encontrado nesta pasta.",
            (material) => this.renderFichaTecnica(material)
        );

        // 2. Mapeia os cards que acabaram de ser injetados no DOM para adicionar o listener de exclusão
        const cards = listaContainer.querySelectorAll('.material-card');
        cards.forEach((card, index) => {
            const material = lista[index];
            const btnExcluir = card.querySelector('.btn-excluir-material');
            
            if (btnExcluir) {
                btnExcluir.addEventListener('click', (e) => {
                    e.stopPropagation(); // Crucial: impede que o clique abra a ficha técnica do material
                    
                    // Executa a sua lógica de exclusão passando a pasta atual e o objeto do material
                    this.excluirMaterialDaPasta(this.pastaAberta, material);
                });
            }
        });
    }

    // Exemplo de assinatura do método que vai processar a exclusão no banco/estado
    async excluirMaterialDaPasta(nomePasta, material) {
        if (!confirm(`Tem certeza que deseja remover ${material.nome} da pasta "${this.pastaAberta}"?`)) return;
        
        try {
            const idOuNome = material.id || material.nome;
            const resultado = await this.api.deletarMaterial(this.pastaAberta, idOuNome);

            if (resultado.sucesso || !resultado.erro) {
                alert("Material removido com sucesso!");
                this.abrirPasta(this.pastaAberta);
            } else {
                alert(`Erro ao remover: ${resultado.erro}`);
            }
        } catch (error) {
            alert("Erro de comunicação com o servidor.");
            console.error(error);
        }
    }
    
    // Sobrescreve o método da classe pai APENAS para a interface do usuário logado
    renderConteudoCardMaterial(material) {
        // Pega o HTML padrão (as infos e o botão de "Visualizar Ficha Técnica")
        const htmlBase = super.renderConteudoCardMaterial(material);
        
        // Cria o botão de excluir seguindo o mesmo padrão visual dos cards de pasta
        const botaoExcluir = this.criarBotao({ 
            id: '', 
            texto: '🗑️', 
            variante: 'perigo', 
            classeExtra: 'btn-icon-pasta btn-excluir-material' 
        });

        // Retorna o container absoluto no topo + o conteúdo base do card
        return `
            <div class="card-actions-container">
                ${botaoExcluir}
            </div>
            ${htmlBase}
        `;
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

    // ==========================================
    // FICHA TÉCNICA (somente leitura) + ações de CRUD do material
    // ==========================================

    renderFichaTecnica(material) {
        const botaoCompartilhar = this.criarBotao({
            id: 'btn-compartilhar-central',
            texto: '🌐 Compartilhar com o Catálogo Central',
            variante: 'submit',
        });

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

                ${this.renderGridPropriedades(material)}

                ${this.renderBlocoAcoes(botaoCompartilhar)}
            </div>
        `;

        this.configurarEventosFichaPrivada(material);
    }

    configurarEventosFichaPrivada(material) {
        // Voltar retorna para a pasta aberta, não para a raiz do app
        this.container.querySelector('#btn-voltar-pasta').addEventListener('click', () => {
            this.abrirPasta(this.pastaAberta);
        });

        // Botão de compartilhar com o catálogo central
        this.container.querySelector('#btn-compartilhar-central').addEventListener('click', async () => {
            if (!confirm(`Enviar "${material.nome}" para a fila de homologação do catálogo central?`)) return;

            try {
                const resultado = await this.api.compartilharComCentral(this.pastaAberta, material.nome);
                if (resultado.sucesso || !resultado.erro) {
                    alert(resultado.mensagem || "Material enviado para homologação!");
                } else {
                    alert(`Erro ao compartilhar: ${resultado.erro}`);
                }
            } catch (error) {
                alert("Erro de comunicação com o servidor ao compartilhar o material.");
                console.error(error);
            }
        });
    }
}