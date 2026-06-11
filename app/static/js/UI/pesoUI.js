import { API } from '../api.js';

export class pesoUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Força Peso";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Força Peso...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Força Peso</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MASSA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa-p" placeholder="Massa (kg)"></td>
                    <td><button class="table-SI" tabindex="-1">Kg</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">GRAVIDADE:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-gravidade-p" placeholder="Gravidade (m/s²)"></td>
                    <td><button class="table-SI" tabindex="-1">m/s²</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">PESO (FORÇA):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-peso-p" placeholder="Peso (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-p">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container-p"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-p');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Força Peso clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container-p');
            
            const inputMassa = document.getElementById('input-massa-p');
            const inputGravidade = document.getElementById('input-gravidade-p');
            const inputPeso = document.getElementById('input-peso-p');
            
            // Monta o payload interpretando campos vazios como null para o Solver em Python
            const payload = {
                massa: parseFloat(inputMassa.value) || null,
                gravidade: parseFloat(inputGravidade.value) || null,
                peso: parseFloat(inputPeso.value) || null
            };

            // Validação padrão do Solver do EngenhApp (precisa de exatamente 2 campos)
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
                // Dispara a requisição encapsulada no api.js
                const dados = await API.dinamica.calcularPeso(payload);
                
                // Preenche o input que estava vazio com base no retorno do dicionário Python
                if (dados.massa !== undefined) {
                    inputMassa.value = dados.massa;
                } else if (dados.gravidade !== undefined) {
                    inputGravidade.value = dados.gravidade;
                } else if (dados.peso !== undefined) {
                    inputPeso.value = dados.peso;
                }
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao processar o cálculo de peso no servidor.");
                console.error(error);
            }
        });
    }
}