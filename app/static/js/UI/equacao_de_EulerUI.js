import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class equacao_de_EulerUI extends BaseCalculoUI {
    constructor() {
        super(
            "🔮 Structural Stability - Equação de Euler",
            [
                { id: "carga_atuante", label: "CARGA ATUANTE (P)", si: "N", placeholder: "Força de compressão aplicada" },
                { id: "modulo_elasticidade", label: "MÓDULO DE ELASTICIDADE (E)", si: "Pa", placeholder: "Rigidez do material (Ex: Aço = 2e11)" },
                { id: "momento_inercia", label: "MOMENTO DE INÉRCIA (I)", si: "m⁴", placeholder: "Inércia geométrica da seção" },
                { id: "comprimento", label: "COMPRIMENTO DA COLUNA (L)", si: "m", placeholder: "Altura total do pilar" },
                {
                    id: "tipo_fixacao",
                    label: "CONDIÇÃO DE FIXAÇÃO",
                    si: "tipo",
                    tipo: "select",
                    opcoes: [
                        { valor: "biarticulada", label: "Biarticulada (Pinos -> K=1.0)" },
                        { valor: "biengastada", label: "Biengastada (Engastes -> K=0.65)" },
                        { valor: "engastada_livre", label: "Engastada e Livre (K=2.1)" },
                        { valor: "engastada_articulada", label: "Engastada e Articulada (K=0.8)" }
                    ]
                },
                { id: "coeficiente_seguranca", label: "COEFICIENTE DE SEGURANÇA (FS)", si: "unid.", placeholder: "Padrão: 2.5", padrao: 2.5 }
            ],
            API.engenharia.calcularEuler,
            `💡 <strong>Diretrizes:</strong> Preencha as 4 variáveis para verificar a estabilidade ou deixe exatamente UMA em branco para dimensionar.`,
            { validacaoAutomatica: false } // 🔥 Desativa a automação aqui!
        );
        
        this.nomeMenu = "Equação de Euler (Flambagem)";
    }

    // Override total da validação porque a regra de engenharia aqui é customizada
    validarPayload(payload) {
        if (!payload.tipo_fixacao) {
            alert("Por favor, selecione o tipo de fixação da coluna.");
            return false;
        }
        const fundamentais = [payload.carga_atuante, payload.modulo_elasticidade, payload.momento_inercia, payload.comprimento];
        const preenchidos = fundamentais.filter(v => v !== null).length;

        if (preenchidos < 3) {
            alert("Por favor, preencha ao menos três parâmetros físicos para realizar o cálculo.");
            return false;
        }
        return true;
    }

    renderizarLaudoCustomizado(dados, container) {
        let corBordaStatus = "#0275d8"; 
        let corBackground = "#1a2436";  
    
        if (dados.aprovado !== undefined) {
            corBordaStatus = dados.aprovado ? "#2baf4a" : "#e03b4b"; 
            corBackground = dados.aprovado ? "#162a1c" : "#2d191b";  
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
        container.innerHTML = htmlLaudo;
    }
}

