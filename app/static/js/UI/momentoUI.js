// app/static/js/UI/momentoUI.js

import { API } from '../api.js';

export class momentoUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Momento de uma Força";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Momento Estático...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculo de Momento (Torque)</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">FORÇA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-forca-m" placeholder="Força aplicada (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">DISTÂNCIA (BRAÇO):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-distancia-m" placeholder="Distância ao ponto (m)"></td>
                    <td><button class="table-SI" tabindex="-1">m</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">ÂNGULO (θ):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-angulo-m" value="90" placeholder="Ângulo em graus"></td>
                    <td><button class="table-SI" tabindex="-1">°</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">MOMENTO ESTÁTICO:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-momento-m" placeholder="Momento gerado (N·m)"></td>
                    <td><button class="table-SI" tabindex="-1">N·m</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-m">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular. O ângulo padrão é 90°.</p>
            <div id="resultado-container-m"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-m');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Momento clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-m');
            
            const inputForca = document.getElementById('input-forca-m');
            const inputDistancia = document.getElementById('input-distancia-m');
            const inputMomento = document.getElementById('input-momento-m');
            const inputAngulo = document.getElementById('input-angulo-m');
            
            // Função auxiliar segura: se o campo estiver vazio, retorna null. 
            // Se tiver '0', retorna 0 corretamente sem cair na pegadinha do ||
            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            // 1. Agora capturamos os 4 valores de forma 100% segura para a Física
            const payload = {
                forca: pegarValor(inputForca),
                distancia: pegarValor(inputDistancia),
                momento: pegarValor(inputMomento),
                angulo: pegarValor(inputAngulo)
            };

            // 2. Validação para 4 variáveis: precisamos de EXATAMENTE 3 preenchidas
            const preenchidos = Object.values(payload).filter(v => v !== null);
            
            if (preenchidos.length < 3) {
                alert("Por favor, preencha pelo menos três campos para calcular o quarto.");
                return;
            }
            if (preenchidos.length > 3) {
                alert("Por favor, deixe exatamente um campo em branco para calcular o seu valor.");
                return;
            }

            try {
                const dados = await API.estatica.calcularMomento(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                // 3. Preenchimento automático inteligente
                if (dados.forca !== undefined) inputForca.value = dados.forca;
                if (dados.distancia !== undefined) inputDistancia.value = dados.distancia;
                if (dados.momento !== undefined) inputMomento.value = dados.momento;
                if (dados.angulo !== undefined) inputAngulo.value = dados.angulo;
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao processar o cálculo de momento no servidor.");
                console.error(error);
            }
        });
    }
}