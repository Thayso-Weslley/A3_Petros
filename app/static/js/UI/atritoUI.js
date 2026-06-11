// app/static/js/UI/atritoUI.js

import { API } from '../api.js';

export class atritoUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Força de Atrito";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Força de Atrito...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculo de Força de Atrito</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">COEFICIENTE DE ATRITO (μ):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-coeficiente-at" placeholder="Coeficiente (Adimensional)"></td>
                    <td><button class="table-SI" tabindex="-1">-</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">FORÇA NORMAL (N):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-normal-at" placeholder="Força Normal (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">FORÇA DE ATRITO (Fat):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-atrito-at" placeholder="Força de Atrito (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-at">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-at"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-at');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Atrito clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-at');
            
            const inputCoeficiente = document.getElementById('input-coeficiente-at');
            const inputNormal = document.getElementById('input-normal-at');
            const inputAtrito = document.getElementById('input-atrito-at');
            
            // Captura limpa para aceitar o valor 0 de forma legítima
            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                coeficiente: pegarValor(inputCoeficiente),
                normal: pegarValor(inputNormal),
                atrito: pegarValor(inputAtrito)
            };

            // Validação padrão do Solver (Exige exatamente 2 campos preenchidos)
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
                const dados = await API.estatica.calcularAtrito(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                // Distribui os resultados calculados pelo Python de volta na tela
                if (dados.coeficiente !== undefined) inputCoeficiente.value = dados.coeficiente;
                if (dados.normal !== undefined) inputNormal.value = dados.normal;
                if (dados.atrito !== undefined) inputAtrito.value = dados.atrito;
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                console.error(error);
            }
        });
    }
}