// app/static/js/UI/trabalhoUI.js

import { API } from '../api.js';

export class trabalhoUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Trabalho Mecânico";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Trabalho Mecânico...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculo de Trabalho Mecânico</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">FORÇA (F):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-forca-tr" placeholder="Força aplicada (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">DESLOCAMENTO (d):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-distancia-tr" placeholder="Distância percorrida (m)"></td>
                    <td><button class="table-SI" tabindex="-1">m</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">TRABALHO REALIZADO (W):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-trabalho-tr" placeholder="Trabalho gerado (J)"></td>
                    <td><button class="table-SI" tabindex="-1">J</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-tr">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-tr"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-tr');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Trabalho clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-tr');
            
            const inputForca = document.getElementById('input-forca-tr');
            const inputDistancia = document.getElementById('input-distancia-tr');
            const inputTrabalho = document.getElementById('input-trabalho-tr');
            
            // Captura limpa para evitar problemas com valores nulos/falsos do JS
            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                forca: pegarValor(inputForca),
                distancia: pegarValor(inputDistancia),
                trabalho: pegarValor(inputTrabalho)
            };

            // Validação do Solver (precisa de exatamente 2 campos preenchidos)
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
                const dados = await API.dinamica.calcularTrabalho(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                // Distribui o retorno do Python nos campos da tela
                if (dados.forca !== undefined) inputForca.value = dados.forca;
                if (dados.distancia !== undefined) inputDistancia.value = dados.distancia;
                if (dados.trabalho !== undefined) inputTrabalho.value = dados.trabalho;
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                console.error(error);
            }
        });
    }
}