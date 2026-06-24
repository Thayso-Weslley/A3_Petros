export class BaseCalculoUI {
    constructor(titulo, camposInput, acaoCalculoApi, diretrizes = '', configuracoes = {}) {
        this.titulo = titulo;
        this.camposInput = camposInput;
        this.acaoCalculoApi = acaoCalculoApi;
        this.diretrizes = diretrizes;
        this.config = { // Configurações padrão automáticas (Convenção sobre Configuração)
            validacaoAutomatica: configuracoes.validacaoAutomatica ?? true,
            camposIgnoradosNaContagem: configuracoes.camposIgnoradosNaContagem ?? [] // Ex: IDs de selects ou FS
        };
    }

    renderizarLinha(campo) {
        let elementoHtml = '';

        if (campo.tipo === 'select') {
            const opcoesHtml = campo.opcoes.map(op => `
                <option value="${op.valor}" ${op.valor === campo.padrao ? 'selected' : ''} style="background-color: #2c2c2c; color: #fff;">
                    ${op.label}
                </option>
            `).join('');

            elementoHtml = `
                <select class="table-input" id="input-${campo.id}" style="color: #fff; background-color: #2c2c2c; border: 1px solid #444; cursor: pointer; width: 100%; height: 100%; padding: 4px;">
                    <option value="" style="background-color: #2c2c2c; color: #aaa;">-- Selecione --</option>
                    ${opcoesHtml}
                </select>
            `;
        } else {
            const valorPadrao = campo.padrao !== undefined ? `value="${campo.padrao}"` : '';
            elementoHtml = `
                <input class="table-input" type="number" id="input-${campo.id}" 
                       placeholder="${campo.placeholder || ''}" ${valorPadrao}>
            `;
        }

        return `
            <tr style="height: 60px;">
                <td class="table-label">${campo.label}:</td>
                <td class="td-input">${elementoHtml}</td>
                <td><button class="table-SI" tabindex="-1">${campo.si || 'unid.'}</button></td>
            </tr>
        `;
    }

    // 🛡️ Validação Geral Base (O "Velho Padrão" automático)
    validarPayload(payload) {
        // Se a classe filha desativar a validação automática, ela assume o controle total
        if (!this.config.validacaoAutomatica) return true;

        // Filtra os campos numéricos reais do Solver (ignora selects e coeficientes fixos configurados)
        const camposSolver = this.camposInput.filter(campo => 
            campo.tipo !== 'select' && !this.config.camposIgnoradosNaContagem.includes(campo.id)
        );

        const totalCampos = camposSolver.length;
        const preenchidos = camposSolver.filter(campo => payload[campo.id] !== null).length;
        const vazios = totalCampos - preenchidos;

        // Regra de ouro do Solver: Exatamente 1 em branco
        if (vazios > 1) {
            alert(`Por favor, preencha pelo menos ${totalCampos - 1} campos para calcular o restante.`);
            return false;
        }
        if (vazios === 0) {
            alert("Por favor, deixe exatamente UM campo em branco para calcular o valor correspondente.");
            return false;
        }

        return true;
    }

    renderizarLaudoCustomizado(dados, container) {
        container.innerHTML = `
            <div style="padding: 14px; background-color: #162a1c; border: 1px solid #2baf4a; border-radius: 6px; color: #fff;">
                <strong>✅ Cálculo concluído com sucesso!</strong> Os parâmetros foram atualizados no painel.
            </div>
        `;
    }

    render(containerPrincipal) {
        const linesHtml = this.camposInput.map(campo => this.renderizarLinha(campo)).join('');

        containerPrincipal.innerHTML = `
            <h2>${this.titulo}</h2>
            <table class="table">
                ${linesHtml}
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-base">Analisar / Calcular</button></td>
                </tr>
            </table>
            
            ${this.diretrizes ? `<p style="margin-top: 12px; font-size: 0.9rem; color: #aaa; line-height: 1.4;">${this.diretrizes}</p>` : ''}
            <div id="resultado-container-base" style="margin-top: 20px;"></div>
        `;

        this.configurarEventos(containerPrincipal);
    }

    configurarEventos(containerPrincipal) {
        const btn = containerPrincipal.querySelector('#btn-enviar-calc-base');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            const resContainer = containerPrincipal.querySelector('#resultado-container-base');
            resContainer.innerHTML = "";

            const payload = {};
            this.camposInput.forEach(campo => {
                const input = containerPrincipal.querySelector(`#input-${campo.id}`);
                if (campo.tipo === 'select') {
                    payload[campo.id] = input.value || null;
                } else {
                    payload[campo.id] = input.value.trim() === '' ? null : parseFloat(input.value);
                }
            });

            // Executa a validação (seja a automática da mãe ou a customizada por override)
            if (!this.validarPayload(payload)) return;

            try {
                const dados = await this.acaoCalculoApi(payload);
                if (dados.erro) { alert(dados.erro); return; }

                this.camposInput.forEach(campo => {
                    if (campo.tipo !== 'select' && dados[campo.id] !== undefined) {
                        containerPrincipal.querySelector(`#input-${campo.id}`).value = dados[campo.id];
                    }
                });

                this.renderizarLaudoCustomizado(dados, resContainer);
            } catch (error) {
                alert("Falha ao processar operação no motor de cálculo.");
                console.error(error);
            }
        });
    }
}