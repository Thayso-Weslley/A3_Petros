const USUARIO_CACHE_STORAGE_KEY = 'engenhapp.usuarioMateriaisCache';
const CATALOGO_CACHE_STORAGE_KEY = 'engenhapp.catalogoMateriaisCache';

/**
 *  Carrega o cache do usuário do sessionStorage, retornando um objeto com as pastas e materiais por pasta.
 */
function carregarCacheUsuario() {
    try {
        const raw = sessionStorage.getItem(USUARIO_CACHE_STORAGE_KEY);
        if (!raw) return { pastas: null, materiaisPorPasta: {} };
        const parsed = JSON.parse(raw);
        return {
            pastas: Array.isArray(parsed.pastas) ? parsed.pastas : null,
            materiaisPorPasta: parsed.materiaisPorPasta && typeof parsed.materiaisPorPasta === 'object'
                ? parsed.materiaisPorPasta
                : {}
        };
    } catch (err) {
        console.warn('Não foi possível carregar cache do usuário:', err);
        return { pastas: null, materiaisPorPasta: {} };
    }
}

function salvarCacheUsuario(cache) {
    try {
        sessionStorage.setItem(USUARIO_CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch (err) {
        console.warn('Não foi possível salvar cache do usuário:', err);
    }
}

function carregarCacheCatalogo() {
    try {
        const raw = sessionStorage.getItem(CATALOGO_CACHE_STORAGE_KEY);
        if (!raw) return { paginas: {} };
        const parsed = JSON.parse(raw);
        return {
            paginas: parsed.paginas && typeof parsed.paginas === 'object' ? parsed.paginas : {}
        };
    } catch (err) {
        console.warn('Não foi possível carregar cache do catálogo:', err);
        return { paginas: {} };
    }
}

function salvarCacheCatalogo(cache) {
    try {
        sessionStorage.setItem(CATALOGO_CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch (err) {
        console.warn('Não foi possível salvar cache do catálogo:', err);
    }
}

function gerarChaveCatalogo(page, perPage, sortBy, direction) {
    return `${page}|${perPage}|${sortBy}|${direction}`;
}

export const API = {
    dinamica: {
        /**
         * Envia os dados da 2° Lei de Newton para o backend calcular
         * @param {Object} payload - { massa, aceleracao, forca }
         * @returns {Promise<Object>} Dados calculados vindos do Python
         */
        async calcularSegundaLei(payload) {
            const response = await fetch('/api/dinamica/lei_de_newton/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erro no servidor: ${response.status}`);
            }

            return await response.json(); // Retorna o JSON processado
        },

        async calcularEnergiaCinetica(payload) {
            const response = await fetch('/api/dinamica/energia_cinetica/calcular', { // Ajuste a URL se a sua rota no Flask for ligeiramente diferente
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularPeso(payload) {
            const response = await fetch('/api/dinamica/peso/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularPotencia(payload) {
            const response = await fetch('/api/dinamica/potencia/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularQuantidadeMovimento(payload) {
            const response = await fetch('/api/dinamica/quantidade_de_movimento/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularTrabalho(payload) {
            const response = await fetch('/api/dinamica/trabalho/calcular', { // Ajuste o endpoint conforme seu padrão no Flask
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        }
    },

    estatica: {
        async calcularMomento(payload) {
            const response = await fetch('/api/estatica/momento/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularAtrito(payload) {
            const response = await fetch('/api/estatica/atrito/calcular', { // Ajuste se o seu endpoint do Flask mudar
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        }
    },

    engenharia: {
        async calcularNavier(payload) {
            const response = await fetch('/api/engenharia/navier/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularEuler(payload) {
            const response = await fetch('/api/engenharia/equacao_de_Euler/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        }
    },

    materiais: {
        _cacheCatalogo: carregarCacheCatalogo(),

        async obterCatalogo(page = 1, perPage = 200, sortBy = 'nome', direction = 'ASC') {
            const cacheKey = gerarChaveCatalogo(page, perPage, sortBy, direction);
            const cached = this._cacheCatalogo.paginas[cacheKey];
            if (cached) {
                return cached;
            }

            const query = new URLSearchParams({
                page: String(page),
                per_page: String(perPage),
                sort_by: sortBy,
                direction: direction
            });
            const response = await fetch(`/api/materiais/catalogo?${query.toString()}`);
            if (!response.ok) {
                if (cached) return cached;
                throw new Error("Erro ao buscar catálogo");
            }

            const dados = await response.json();
            this._cacheCatalogo.paginas[cacheKey] = dados;
            salvarCacheCatalogo(this._cacheCatalogo);
            return dados;
        },

        // Sub-objeto para organizar as requisições específicas do inventário do usuário
        usuario: {
            _cache: carregarCacheUsuario(),

            // ==========================================
            // OPERAÇÕES DE LEITURA (GET)
            // ==========================================

            /** Retorna todas as listas cadastradas pelo usuário no banco. */
            async obterListas() {
                if (this._cache.pastas) {
                    return this._cache.pastas;
                }

                const res = await fetch('/api/usuario/listas');
                if (!res.ok) {
                    if (this._cache.pastas) return this._cache.pastas;
                    throw new Error("Erro na rede ao buscar listas do usuário.");
                }

                const dados = await res.json();
                this._cache.pastas = dados || [];
                salvarCacheUsuario(this._cache);
                return this._cache.pastas;
            },

            /** Retorna todos os materiais vinculados a uma lista específica. */
            async obterMateriaisDaLista(nomeLista) {
                const cached = this._cache.materiaisPorPasta[nomeLista];
                if (cached) {
                    return cached;
                }

                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais`);
                if (!res.ok) {
                    if (cached) return cached;
                    throw new Error(`Erro ao buscar materiais da lista: ${nomeLista}`);
                }

                const dados = await res.json();
                const itens = dados.itens || dados || [];
                this._cache.materiaisPorPasta[nomeLista] = itens;
                salvarCacheUsuario(this._cache);
                return itens;
            },

            /** Realiza um JOIN no banco e retorna o inventário completo do usuário. */
            async obterTodos() {
                const res = await fetch('/api/usuario/materiais');
                if (!res.ok) throw new Error("Erro ao buscar inventário completo.");
                return await res.json();
            },

            // ==========================================
            // OPERAÇÕES DE CRIAÇÃO E ESCRITA (POST)
            // ==========================================

            /** Registra uma nova lista no banco de dados. */
            async criarLista(nomeLista) {
                const res = await fetch('/api/usuario/listas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome_lista: nomeLista })
                });
                const dados = await res.json();
                if (dados.sucesso || !dados.erro) {
                    this._cache.pastas = null;
                    this._cache.materiaisPorPasta = {};
                    salvarCacheUsuario(this._cache);
                }
                return dados;
            },

            /** Insere (ou atualiza) um material e cria o vínculo com a lista. 
             * ATENÇÃO: A ordem na chamada deve ser (nomeLista, objetoMaterial)
             */
            async adicionar(nomeLista, dadosMaterial, nomeAnterior = null) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        material: dadosMaterial, 
                        nome_anterior: nomeAnterior 
                    })
                });
                const dados = await res.json();
                if (dados.sucesso || !dados.erro) {
                    this._cache.pastas = null;
                    delete this._cache.materiaisPorPasta[nomeLista];
                    if (nomeAnterior && nomeAnterior !== nomeLista) {
                        delete this._cache.materiaisPorPasta[nomeAnterior];
                    }
                    salvarCacheUsuario(this._cache);
                }
                return dados;
            },

            // ==========================================
            // OPERAÇÕES DE ATUALIZAÇÃO (PUT)
            // ==========================================

            /** Altera o nome de uma lista, atualizando os vínculos em cascata (ON UPDATE CASCADE). */
            async renomearLista(nomeAntigo, nomeNovo) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeAntigo)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome_novo: nomeNovo })
                });
                const dados = await res.json();
                if (dados.sucesso || !dados.erro) {
                    this._cache.pastas = null;
                    this._cache.materiaisPorPasta[nomeNovo] = this._cache.materiaisPorPasta[nomeAntigo] || null;
                    delete this._cache.materiaisPorPasta[nomeAntigo];
                    salvarCacheUsuario(this._cache);
                }
                return dados;
            },

            // ==========================================
            // OPERAÇÕES DE EXCLUSÃO (DELETE)
            // ==========================================

            /** Apaga a lista e remove os vínculos via Garbage Collection no SQLite. */
            async deletarLista(nomeLista) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}`, {
                    method: 'DELETE'
                });
                const dados = await res.json();
                if (dados.sucesso || !dados.erro) {
                    this._cache.pastas = null;
                    delete this._cache.materiaisPorPasta[nomeLista];
                    salvarCacheUsuario(this._cache);
                }
                return dados;
            },

            /** Remove o vínculo N:N entre o material e a lista específica. */
            async deletarMaterial(nomeLista, idOuNomeMaterial) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais/${encodeURIComponent(idOuNomeMaterial)}`, {
                    method: 'DELETE'
                });
                const dados = await res.json();
                if (dados.sucesso || !dados.erro) {
                    if (this._cache.materiaisPorPasta[nomeLista]) {
                        this._cache.materiaisPorPasta[nomeLista] = this._cache.materiaisPorPasta[nomeLista].filter(item =>
                            item.id !== idOuNomeMaterial && item.nome !== idOuNomeMaterial
                        );
                        salvarCacheUsuario(this._cache);
                    }
                }
                return dados;
            },

            // ==========================================
            // SINCRONIZAÇÃO / CROWDSOURCING
            // ==========================================

            /** Dispara o payload do material local para a fila de homologação global. */
            async compartilharComCentral(nomeLista, nomeMaterial) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais/${encodeURIComponent(nomeMaterial)}/compartilhar`, {
                    method: 'POST'
                });
                return await res.json();
            }
        }   
        
    }
};