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
        }
    },

    materiais: {
        async obterCatalogo() {
            const response = await fetch('/api/materiais/catalogo');
            if (!response.ok) throw new Error("Erro ao buscar catálogo");
            return await response.json();
        }
    }
};