// app/static/js/UI/quantidade_de_movimentoUI.js

import { API } from "../api.js";

export class quantidade_de_movimentoUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Quantidade de Movimento";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Quantidade de Movimento...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculo de Quantidade de Movimento (Momento Linear)</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MASSA (m):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa-qm" placeholder="Massa do corpo (kg)"></td>
                    <td><button class="table-SI" tabindex="-1">Kg</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">VELOCIDADE (v):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-velocidade-qm" placeholder="Velocidade (m/s)"></td>
                    <td><button class="table-SI" tabindex="-1">m/s</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">QUANTIDADE DE MOVIMENTO (Q):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-quantidade-qm" placeholder="Quantidade de Movimento (kg·m/s)"></td>
                    <td><button class="table-SI" tabindex="-1">kg·m/s</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-qm">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-qm"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-qm');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Qtd de Movimento clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-qm');
            
            const inputMassa = document.getElementById('input-massa-qm');
            const inputVelocidade = document.getElementById('input-velocidade-qm');
            const inputQuantidade = document.getElementById('input-quantidade-qm');
            
            // Tratamento contra o bug do zero do JavaScript puro
            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                massa: pegarValor(inputMassa),
                velocidade: pegarValor(inputVelocidade),
                quantidade_de_movimento: pegarValor(inputQuantidade)
            };

            // Validação padrão do Solver do EngenhApp (Precisamos de exatamente 2 campos)
            const preenchidos = Object.values(payload).filter(v => v !== null);
            if (preenchidos.length < 2) {
                alert("Por favor, preencha pelo menos dois campos para calcular o terceiro.");
                return;
            }
            if (preenchidos.length > 2) {
                alert("Por favor, deixe um campo em branco para calcular o valor correspondente.");
                return;
            }

            try {
                // Dispara requisição encapsulada
                const dados = await API.dinamica.calcularQuantidadeMovimento(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                // Injeta o retorno do Python no campo que estava em branco
                if (dados.massa !== undefined) inputMassa.value = dados.massa;
                if (dados.velocidade !== undefined) inputVelocidade.value = dados.velocidade;
                if (dados.quantidade_de_movimento !== undefined) inputQuantidade.value = dados.quantidade_de_movimento;
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                console.error(error);
            }
        });
    }
}