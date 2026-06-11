// app/static/js/UI/energia_cineticaUI.js

import { API } from '../api.js';

export class energia_cineticaUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Energia Cinética";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Energia Cinética...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Energia Cinética</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MASSA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa-ec" placeholder="Massa (kg)"></td>
                    <td><button class="table-SI" tabindex="-1">Kg</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">VELOCIDADE:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-velocidade-ec" placeholder="Velocidade (m/s)"></td>
                    <td><button class="table-SI" tabindex="-1">m/s</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">ENERGIA CINÉTICA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-energia-ec" placeholder="Energia (J)"></td>
                    <td><button class="table-SI" tabindex="-1">J</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-ec">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-ec"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-ec');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Energia Cinética clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-ec');
            
            const inputMassa = document.getElementById('input-massa-ec');
            const inputVelocidade = document.getElementById('input-velocidade-ec');
            const inputEnergia = document.getElementById('input-energia-ec');
            
            // Monta o payload interpretando strings vazias como null para o Solver do seu Python
            const payload = {
                massa: parseFloat(inputMassa.value) || null,
                velocidade: parseFloat(inputVelocidade.value) || null,
                energia: parseFloat(inputEnergia.value) || null
            };

            // Validação estrita do Solver (Mínimo 2 preenchidos, Máximo 2 preenchidos)
            const preenhidos = Object.values(payload).filter(v => v !== null);
            if (preenhidos.length < 2) {
                alert("Por favor, preencha pelo menos dois campos para calcular o terceiro.");
                return;
            }
            if (preenhidos.length > 2) {
                alert("Por favor, deixe um campo em branco para calcular o valor correspondente.");
                return;
            }

            try {
                // Chama o centralizador mapeado no Passo 1
                const dados = await API.dinamica.calcularEnergiaCinetica(payload);
                
                // Preenchimento Automático baseado no retorno das chaves do dicionário do Python
                if (dados.massa !== undefined) {
                    inputMassa.value = dados.massa;
                } else if (dados.velocidade !== undefined) {
                    inputVelocidade.value = dados.velocidade;
                } else if (dados.energia !== undefined) {
                    inputEnergia.value = dados.energia;
                }
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao processar o cálculo no servidor.");
                console.error(error);
            }
        });
    }
}