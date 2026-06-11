// conexão com o arquivo excluivo de comunicação com o backend, onde estão as funções de chamada de rede para a API REST do Flask
import { API } from '../api.js';

export class lei_de_NewtonUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "2° Lei de Newton";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Dinâmica...");
        containerPrincipal.innerHTML = `
            <h2>2° Lei de Newton</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MASSA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa" placeholder="Massa (kg)"></td>
                    <td><button class="table-SI" tabindex="-1">Kg</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">ACELERAÇÃO:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-aceleracao" placeholder="Aceleração (m/s²)"></td>
                    <td><button class="table-SI" tabindex="-1">m/s²</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">FORÇA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-forca" placeholder="Força (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
            <div id="resultado-container"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de cálculo clicado! Preparando dados...");
            const resContainer = document.getElementById('resultado-container');
            
            const inputMassa = document.getElementById('input-massa');
            const inputAceleracao = document.getElementById('input-aceleracao');
            const inputForca = document.getElementById('input-forca');
            
            const payload = {
                massa: parseFloat(inputMassa.value) || null,
                aceleracao: parseFloat(inputAceleracao.value) || null,
                forca: parseFloat(inputForca.value) || null
            };

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
                // A UI delega a transmissão de rede para o api.js e apenas aguarda o dado pronto
                const dados = await API.dinamica.calcularSegundaLei(payload);
                
                // Lógica de Preenchimento Automático na tela
                if (dados.massa !== undefined) {
                    inputMassa.value = dados.massa;
                } else if (dados.aceleracao !== undefined) {
                    inputAceleracao.value = dados.aceleracao;
                } else if (dados.forca !== undefined) {
                    inputForca.value = dados.forca;
                }
                
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao processar o cálculo no servidor.");
                console.error(error);
            }
        });
    }
}