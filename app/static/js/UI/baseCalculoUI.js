// Classe mãe genérica que apenas automatiza a criação do formulário em tabela
export class BaseCalculoUI {
    constructor(titulo, camposInput, rotaCalculoApi, opcoes = {}) {
        this.titulo = titulo;
        this.camposInput = camposInput;
        this.rotaCalculoApi = rotaCalculoApi;
        this.opcoes = { exigirUmVazio: opcoes.exigirUmVazio ?? true };
    }

    // Mantemos exatamente o nome do método que a sua CoreUI/main.js chama
    render(containerPrincipal) {
        const linhasTabela = this.camposInput.map(campo => `
            <tr style="height: 60px;">
                <td class="table-label">${campo.label}:</td>
                <td class="td-input">
                    <input class="table-input" type="number" id="${campo.id}" placeholder="${campo.placeholder || ''}">
                </td>
                <td><button class="table-SI" tabindex="-1">${campo.si}</button></td>
            </tr>
        `).join('');

        containerPrincipal.innerHTML = `
            <h2>${this.titulo}</h2>
            <table class="table">
                ${linhasTabela}
                <tr>
                    <td colspan="3">
                        <button class="table-button-submit" id="btn-enviar-calc">Calcular</button>
                    </td>
                </tr>
            </table>
            <p>${this.opcoes.exigirUmVazio ? 'Deixe em branco o campo que deseja calcular.' : 'Preencha tudo para verificar a segurança ou deixe um campo em branco para calculá-lo.'}</p>
            <div id="resultado-container"></div>
        `;

        // Dispara os eventos logo após injetar o HTML no contêiner
        this.configurarEventos(containerPrincipal);
    }

    configurarEventos(containerPrincipal) {
        const btn = containerPrincipal.querySelector('#btn-enviar-calc');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            const resContainer = containerPrincipal.querySelector('#resultado-container');
            const payload = {};

            this.camposInput.forEach(campo => {
                const elemento = containerPrincipal.querySelector(`#${campo.id}`);
                payload[campo.id] = elemento.value !== "" ? parseFloat(elemento.value) : null;
            });

            const quantidadeVazios = Object.values(payload).filter(v => v === null).length;

            // Validação inteligente baseada nas opções que você definiu no construtor
            if (this.opcoes.exigirUmVazio) {
                if (quantidadeVazios !== 1) {
                    alert("Por favor, deixe exatamente um campo em branco para calcular o seu valor.");
                    return;
                }
            } else {
                if (quantidadeVazios > 1) {
                    alert("Dados insuficientes. Preencha todos os campos para verificação ou deixe apenas um em branco.");
                    return;
                }
            }

            try {
                const dados = await this.rotaCalculoApi(payload);
                
                this.camposInput.forEach(campo => {
                    if (dados[campo.id] !== undefined && dados[campo.id] !== null) {
                        containerPrincipal.querySelector(`#${campo.id}`).value = dados[campo.id];
                    }
                });
                
                resContainer.innerHTML = `<strong>${dados.mensagem_sucesso || 'Cálculo concluído com sucesso!'}</strong>`;

            } catch (error) {
                alert("Erro ao processar o cálculo no servidor.");
                console.error(error);
            }
        });
    }
}