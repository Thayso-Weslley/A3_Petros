// app/static/js/UI/potenciaUI.js

import { API } from '../api.js';

export class potenciaUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Potência Mecânica";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Potência...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculo de Potência Mecânica</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">TRABALHO (W):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-trabalho-pot" placeholder="Trabalho realizado (J)"></td>
                    <td><button class="table-SI" tabindex="-1">J</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">TEMPO (Δt):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-tempo-pot" placeholder="Intervalo de tempo (s)"></td>
                    <td><button class="table-SI" tabindex="-1">s</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">POTÊNCIA (P):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-potencia-pot" placeholder="Potência gerada (W)"></td>
                    <td><button class="table-SI" tabindex="-1">W</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-pot">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-pot"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-pot');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Potência clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-pot');
            
            const inputTrabalho = document.getElementById('input-trabalho-pot');
            const inputTempo = document.getElementById('input-tempo-pot');
            const inputPotencia = document.getElementById('input-potencia-pot');
            
            // Captura limpa ignorando strings vazias, mas aceitando o número 0 de forma legítima
            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                trabalho: pegarValor(inputTrabalho),
                tempo: pegarValor(inputTempo),
                potencia: pegarValor(inputPotencia)
            };

            // Validação padrão do Solver do EngenhApp (3 campos, precisamos de exatamente 2 preenchidos)
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
                const dados = await API.dinamica.calcularPotencia(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                // Preenchimento automático com o retorno do dicionário Python
                if (dados.trabalho !== undefined) inputTrabalho.value = dados.trabalho;
                if (dados.tempo !== undefined) inputTempo.value = dados.tempo;
                if (dados.potencia !== undefined) inputPotencia.value = dados.potencia;
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                console.error(error);
            }
        });
    }
}