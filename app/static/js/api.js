export const API = {
    dinamica: {
        /**
         * Envia os dados da 2° Lei de Newton para o backend calcular
         * @param {Object} payload - { massa, aceleracao, forca }
         * @returns {Promise<Object>} Dados calculados vindos do Python
         */
        async calcularSegundaLei(payload) {
            const response = await fetch('/api/lei_de_newton/calcular', {
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
            const response = await fetch('/api/energia_cinetica/calcular', { // Ajuste a URL se a sua rota no Flask for ligeiramente diferente
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularPeso(payload) {
            const response = await fetch('/api/peso/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularPotencia(payload) {
            const response = await fetch('/api/potencia/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularQuantidadeMovimento(payload) {
            const response = await fetch('/api/quantidade_de_movimento/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularTrabalho(payload) {
            const response = await fetch('/api/trabalho/calcular', { // Ajuste o endpoint conforme seu padrão no Flask
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
            const response = await fetch('/api/momento/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);
            return await response.json();
        },

        async calcularAtrito(payload) {
            const response = await fetch('/api/atrito/calcular', { // Ajuste se o seu endpoint do Flask mudar
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
            async obterListas() {
                const res = await fetch('/api/materiais/usuario/listas');
                if (!res.ok) throw new Error("Erro na rede ao buscar pastas do usuário.");
                return await res.json();
            },

            async adicionar(payload) {
                const res = await fetch('/api/materiais/usuario/adicionar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                return await res.json(); // Retorna o dicionário { sucesso: true/false, mensagem/erro }
            },

            async obterTodos() {
                const res = await fetch('/api/materiais/usuario/listar-todos');
                if (!res.ok) throw new Error("Erro ao buscar inventário completo.");
                return await res.json();
            }   
        }
    }
};