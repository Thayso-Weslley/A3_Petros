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
        async obterCatalogo() {
            const response = await fetch('/api/materiais/catalogo');
            if (!response.ok) throw new Error("Erro ao buscar catálogo");
            return await response.json();
        },

        // Sub-objeto para organizar as requisições específicas do inventário do usuário
        usuario: {
            // ==========================================
            // OPERAÇÕES DE LEITURA (GET)
            // ==========================================

            /** Retorna todas as listas cadastradas pelo usuário no banco. */
            async obterListas() {
                const res = await fetch('/api/usuario/listas');
                if (!res.ok) throw new Error("Erro na rede ao buscar listas do usuário.");
                return await res.json();
            },

            /** Retorna todos os materiais vinculados a uma lista específica. */
            async obterMateriaisDaLista(nomeLista) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais`);
                if (!res.ok) throw new Error(`Erro ao buscar materiais da lista: ${nomeLista}`);
                return await res.json();
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
                return await res.json();
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
                return await res.json();
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
                return await res.json();
            },

            // ==========================================
            // OPERAÇÕES DE EXCLUSÃO (DELETE)
            // ==========================================

            /** Apaga a lista e remove os vínculos via Garbage Collection no SQLite. */
            async deletarLista(nomeLista) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}`, {
                    method: 'DELETE'
                });
                return await res.json();
            },

            /** Remove o vínculo N:N entre o material e a lista específica. */
            async deletarMaterial(nomeLista, idOuNomeMaterial) {
                const res = await fetch(`/api/usuario/listas/${encodeURIComponent(nomeLista)}/materiais/${encodeURIComponent(idOuNomeMaterial)}`, {
                    method: 'DELETE'
                });
                return await res.json();
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