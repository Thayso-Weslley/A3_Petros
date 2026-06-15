// app/static/js/UI/equacao_de_EulerUI.js

import { API } from '../api.js';

export class equacao_de_EulerUI {
    constructor() {
        this.cacheLocal = null;
    }

    nomeMenu = "Equação de Euler (Flambagem)";

    render(containerPrincipal) {
        console.log("Renderizando a tela de Equação de Euler...");
        containerPrincipal.innerHTML = `
            <h2>🔮 Structural Stability - Equação de Euler</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">CARGA ATUANTE (P):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-carga-eu" placeholder="Força de compressão aplicada"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">MÓDULO DE ELASTICIDADE (E):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-elasticidade-eu" placeholder="Rigidez do material (Ex: Aço = 2e11)"></td>
                    <td><button class="table-SI" tabindex="-1">Pa</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">MOMENTO DE INÉRCIA (I):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-inercia-eu" placeholder="Inércia geométrica da seção"></td>
                    <td><button class="table-SI" tabindex="-1">m⁴</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">COMPRIMENTO DA COLUNA (L):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-comprimento-eu" placeholder="Altura total do pilar"></td>
                    <td><button class="table-SI" tabindex="-1">m</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">CONDIÇÃO DE FIXAÇÃO:</td>
                    <td class="td-input">
                        <select class="table-input" id="select-fixacao-eu" style="color: #fff; background-color: #2c2c2c; border: 1px solid #444; cursor: pointer; width: 100%; height: 100%; padding: 4px;">
                            <option value="" style="background-color: #2c2c2c; color: #aaa;">-- Selecione as Condições de Contorno --</option>
                            <option value="biarticulada" style="background-color: #2c2c2c; color: #fff;">Biarticulada (Pinos nas duas extremidades -> K=1.0)</option>
                            <option value="biengastada" style="background-color: #2c2c2c; color: #fff;">Biengastada (Engastes rígidos -> K=0.65)</option>
                            <option value="engastada_livre" style="background-color: #2c2c2c; color: #fff;">Engastada e Livre (Poste / Mastro -> K=2.1)</option>
                            <option value="engastada_articulada" style="background-color: #2c2c2c; color: #fff;">Engastada e Articulada (Misto -> K=0.8)</option>
                        </select>
                    </td>
                    <td><button class="table-SI" tabindex="-1">tipo</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">COEFICIENTE DE SEGURANÇA (FS):</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-seguranca-eu" value="2.5" placeholder="Padrão de flambagem: 2.5"></td>
                    <td><button class="table-SI" tabindex="-1">unid.</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc-eu">Analisar Estabilidade</button></td>
                </tr>
            </table>
            
            <p style="margin-top: 12px; font-size: 0.9rem; color: #aaa; line-height: 1.4;">
                💡 <strong>Diretrizes de Operação:</strong><br>
                • <strong>Verificação de Segurança:</strong> Preencha os 4 primeiros campos numéricos para avaliar o risco de colapso.<br>
                • <strong>Dimensionamento:</strong> Deixe exatamente UM dos 4 primeiros campos em branco para descobrir o limite crítico daquela variável.
            </p>
            
            <div id="resultado-container-eu" style="margin-top: 20px;"></div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc-eu');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            console.log("Botão de Euler clicado! Processando matriz de estabilidade estrutural...");
            const resContainer = document.getElementById('resultado-container-eu');
            resContainer.innerHTML = ""; 
            
            const inputCarga = document.getElementById('input-carga-eu');
            const inputElasticidade = document.getElementById('input-elasticidade-eu');
            const inputInercia = document.getElementById('input-inercia-eu');
            const inputComprimento = document.getElementById('input-comprimento-eu');
            const selectFixacao = document.getElementById('select-fixacao-eu');
            const inputSeguranca = document.getElementById('input-seguranca-eu');
            
            const tipoFixacao = selectFixacao.value;
            if (!tipoFixacao) {
                alert("Por favor, selecione o tipo de fixação da coluna (Condição de Contorno).");
                return;
            }

            const pegarValor = (input) => input.value.trim() === '' ? null : parseFloat(input.value);

            const payload = {
                carga_atuante: pegarValor(inputCarga),
                modulo_elasticidade: pegarValor(inputElasticidade),
                momento_inercia: pegarValor(inputInercia),
                comprimento: pegarValor(inputComprimento),
                tipo_fixacao: tipoFixacao,
                coeficiente_seguranca: pegarValor(inputSeguranca)
            };

            const fundamentais = [payload.carga_atuante, payload.modulo_elasticidade, payload.momento_inercia, payload.comprimento];
            const preenchidos = fundamentais.filter(v => v !== null).length;

            if (preenchidos < 3) {
                alert("Por favor, preencha ao menos três parâmetros físicos para realizar o cálculo.");
                return;
            }

            try {
                const dados = await API.engenharia.calcularEuler(payload);
                
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }

                if (dados.carga_atuante !== undefined) inputCarga.value = dados.carga_atuante;
                if (dados.modulo_elasticidade !== undefined) inputElasticidade.value = dados.modulo_elasticidade;
                if (dados.momento_inercia !== undefined) inputInercia.value = dados.momento_inercia;
                if (dados.comprimento !== undefined) inputComprimento.value = dados.comprimento;

                // Ajuste de cores para o Tema Escuro (Cores de fundo opacas e bordas limpas)
                let corBordaStatus = "#0275d8"; // Azul clássico para dimensionamento bem-sucedido
                let corBackground = "#1a2436";  // Fundo escuro azulado discreto

                if (dados.aprovado !== undefined) {
                    corBordaStatus = dados.aprovado ? "#2baf4a" : "#e03b4b"; // Verde levemente mais vivo / Vermelho de alerta
                    corBackground = dados.aprovado ? "#162a1c" : "#2d191b";  // Fundos escuros temáticos (tons de verde e vermelho bem sutis)
                }

                let htmlLaudo = `
                    <div style="border: 1px solid ${corBordaStatus}; background-color: ${corBackground}; padding: 18px; border-radius: 6px; font-family: sans-serif; color: #fff;">
                        <h4 style="color: #fff; margin-top: 0; margin-bottom: 12px; font-size: 1.1rem; border-bottom: 1px solid ${corBordaStatus}80; padding-bottom: 6px;">
                            📋 DIAGNÓSTICO DE ESTABILIDADE: <span style="color: ${corBordaStatus}; font-weight: bold;">${dados.status}</span>
                        </h4>
                        <p style="margin: 8px 0; font-size: 0.95rem; color: #ddd;"><strong>Fator de Comprimento Efetivo (K):</strong> <span style="color: #fff;">${dados.fator_k_utilizado}</span></p>
                `;

                if (dados.carga_critica_teorica !== undefined && dados.carga_admissivel_segura !== undefined) {
                    htmlLaudo += `
                        <p style="margin: 8px 0; font-size: 0.95rem; color: #ddd;"><strong>Carga Crítica de Flambagem (Teórica):</strong> <span style="color: #fff;">${dados.carga_critica_teorica} N</span></p>
                        <p style="margin: 8px 0; font-size: 0.95rem; color: #ddd;"><strong>Carga Limite Admissível:</strong> <span style="color: #fff;">${dados.carga_admissivel_segura} N</span></p>
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
                alert("Falha ao se comunicar com o motor de estabilidade estrutural.");
                console.error(error);
            }
        });
    }
}