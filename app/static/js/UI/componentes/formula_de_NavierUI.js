import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class formula_de_NavierUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo da Fórmula de Navier (Vigas).
     * @param {Function} ApiCalculoNavier: Função usada para calcular a tensão máxima em vigas, fornecida pela API. 
     */
    constructor(ApiCalculoNavier) {
        super(
            "📐 Structural Dimensioning - Fórmula de Navier",
            [
                { id: "momento", label: "MOMENTO FLETOR (M)", si: "N·m", placeholder: "Momento máximo atuante" },
                { id: "modulo_resistencia", label: "MÓDULO DE RESISTÊNCIA (Wx)", si: "m³", placeholder: "Propriedade geométrica do perfil" },
                { id: "tensao_escoamento", label: "TENSÃO DE ESCOAMENTO (σy)", si: "Pa", placeholder: "Resistência limite do material" },
                { id: "coeficiente_seguranca", label: "COEFICIENTE DE SEGURANÇA (FS)", si: "unid.", placeholder: "Padrão da norma: 1.67", padrao: 1.67 }
            ],
            ApiCalculoNavier,
            `💡 <strong>Diretrizes de Operação:</strong><br>
             • <strong>Verificação Estrutural:</strong> Preencha os 3 primeiros campos para analisar se a viga suporta a carga.<br>
             • <strong>Dimensionamento de Limites:</strong> Deixe exatamente UM dos 3 primeiros campos em branco para descobrir sua barreira segura de projeto.`,
            { validacaoAutomatica: false } // 🔥 Desativado para podermos aceitar a Verificação Completa (0 vazios)
        );

        this.nomeMenu = "Fórmula de Navier (Vigas)";
    }

    // 🛡️ Validação customizada para aceitar Verificação (0 vazios) ou Dimensionamento (1 vazio)
    validarPayload(payload) {
        const fundamentais = [payload.momento, payload.modulo_resistencia, payload.tensao_escoamento];
        const preenchidos = fundamentais.filter(v => v !== null).length;

        // Se tiver menos de 2 preenchidos, não dá pra calcular nada
        if (preenchidos < 2) {
            alert("Por favor, forneça pelo menos duas variáveis principais para executar o cálculo ou preencha todas para verificação.");
            return false;
        }
        return true;
    }

    // Customização do laudo em alto contraste para o EngenhApp
    renderizarLaudoCustomizado(dados, container) {
        let corBordaStatus = "#0275d8"; // Azul para dimensionamento funcional
        let corBackground = "#1a2436";  // Tom azul-escuro fosco

        if (dados.aprovado !== undefined) {
            corBordaStatus = dados.aprovado ? "#2baf4a" : "#e03b4b"; // Verde vivo / Vermelho de aviso
            corBackground = dados.aprovado ? "#162a1c" : "#2d191b";  // Fundos escuros temáticos
        }

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
        container.innerHTML = htmlLaudo;
    }
}