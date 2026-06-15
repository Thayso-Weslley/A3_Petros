// app/static/js/UI/formula_de_NavierUI.js

import { API } from '../api.js';

export class formula_de_NavierUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Fórmula de Navier (Vigas)";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Fórmula de Navier...");
        containerPrincipal.innerHTML = `
            <h2> Structural Dimensioning - Fórmula de Navier</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MOMENTO FLETOR (M):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-momento-nv" placeholder="Momento máximo atuante"></td>
                    <td><button class="table-SI" tabindex="-1">N·m</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">MÓDULO DE RESISTÊNCIA (Wx):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-modulo-nv" placeholder="Propriedade geométrica do perfil"></td>
                    <td><button class="table-SI" tabindex="-1">m³</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">TENSÃO DE ESCOAMENTO (σy):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-escoamento-nv" placeholder="Resistência limite do material"></td>
                    <td><button class="table-SI" tabindex="-1">Pa</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">COEFICIENTE DE SEGURANÇA (FS):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-seguranca-nv" value="1.67" placeholder="Padrão da norma: 1.67"></td>
                    <td><button class="table-SI" tabindex="-1">unid.</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-nv">Processar Projeto</button></td>
                </tr>
            </table>
            
            <p style="margin-top: 12px; font-size: 0.9rem; color: #aaa; line-height: 1.4;">
                💡 <strong>Diretrizes de Operação:</strong><br>
                • <strong>Verificação Estrutural:</strong> Preencha os 3 primeiros campos para analisar se a viga suporta a carga.<br>
                • <strong>Dimensionamento de Limites:</strong> Deixe exatamente UM dos 3 primeiros campos em branco para descobrir sua barreira segura de projeto.
            </p>
            
            <div id="resultado-container-nv" style="margin-top: 20px;"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-nv');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Navier clicado! Enviando dados para o solver de engenharia...");
            const resContainer = document.getElementById('resultado-container-nv');
            resContainer.innerHTML = ""; // Reseta a área de laudo técnico
            
            const inputMomento = document.getElementById('input-momento-nv');
            const inputModulo = document.getElementById('input-modulo-nv');
            const inputEscoamento = document.getElementById('input-escoamento-nv');
            const inputSeguranca = document.getElementById('input-seguranca-nv');

            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                momento: pegarValor(inputMomento),
                modulo_resistencia: pegarValor(inputModulo),
                tensao_escoamento: pegarValor(inputEscoamento),
                coeficiente_seguranca: pegarValor(inputSeguranca)
            };

            const principais = [payload.momento, payload.modulo_resistencia, payload.tensao_escoamento];
            const preenchidos = principais.filter(v => v !== null).length;

            if (preenchidos < 2) {
                alert("Por favor, forneça pelo menos duas variáveis principais para executar o cálculo.");
                return;
            }

            try {
                const dados = await API.engenharia.calcularNavier(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                if (dados.momento !== undefined) inputMomento.value = dados.momento;
                if (dados.modulo_resistencia !== undefined) inputModulo.value = dados.modulo_resistencia;
                if (dados.tensao_escoamento !== undefined) inputEscoamento.value = dados.tensao_escoamento;

                // Ajuste de cores para o Dark Mode do EngenhApp
                let corBordaStatus = "#0275d8"; // Azul para dimensionamento funcional
                let corBackground = "#1a2436";  // Tom azul-escuro fosco

                if (dados.aprovado !== undefined) {
                    corBordaStatus = dados.aprovado ? "#2baf4a" : "#e03b4b"; // Verde vivo / Vermelho de aviso
                    corBackground = dados.aprovado ? "#162a1c" : "#2d191b";  // Fundos escuros temáticos opacos
                }

                // Renderização com tags estruturadas em alto contraste (Texto branco/claro)
                let htmlLaudo = `
                    <div style="border: 1px solid ${corBordaStatus}; background-color: ${corBackground}; padding: 18px; border-radius: 6px; font-family: sans-serif; color: #fff;">
                        <h4 style="color: #fff; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem; border-bottom: 1px solid ${corBordaStatus}80; padding-bottom: 6px;">
                            📋 DIAGNÓSTICO TÉCNICO: <span style="color: ${corBordaStatus}; font-weight: bold;">${dados.status}</span>
                        </h4>
                `;

                if (dados.tensao_maxima !== undefined && dados.tensao_admissivel !== undefined) {
                    htmlLaudo += `
                        <p style="margin: 8px 0; font-size: 0.95rem; color: #ddd;"><strong>Tensão Máxima de Trabalho (σ_max):</strong> <span style="color: #fff;">${dados.tensao_maxima} Pa</span></p>
                        <p style="margin: 8px 0; font-size: 0.95rem; color: #ddd;"><strong>Tensão Admissível por Norma (σ_adm):</strong> <span style="color: #fff;">${dados.tensao_admissivel} Pa</span></p>
                    `;
                }

                if (dados.nota_tecnica) {
                    htmlLaudo += `
                        <hr style="border: 0; border-top: 1px solid #444; margin: 12px 0;">
                        <p style="margin: 0; font-style: italic; color: #ccc; font-size: 0.95rem; line-height: 1.4;">
                            <strong>Nota de Projeto:</strong> ${dados.nota_tecnica}
                        </p>
                    `;
                }

                htmlLaudo += `</div>`;
                resContainer.innerHTML = htmlLaudo;

            } catch (error) {
                alert("Falha na comunicação com o servidor de engenharia.");
                console.error(error);
            }
        });
    }
}