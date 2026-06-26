import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class trabalhoUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo de trabalho mecânico.
     * @param {Function} ApiCalculoTrabalho: Função usada para calcular o trabalho, fornecida pela API.
     */
    constructor(ApiCalculoTrabalho) {
        super(
            "🧮 Cálculo de Trabalho Mecânico",
            [
                { id: "forca", label: "FORÇA (F)", si: "N", placeholder: "Força aplicada (N)" },
                { id: "distancia", label: "DESLOCAMENTO (d)", si: "m", placeholder: "Distância percorrida (m)" },
                { id: "trabalho", label: "TRABALHO REALIZADO (W)", si: "J", placeholder: "Trabalho gerado (J)" }
            ],
            ApiCalculoTrabalho,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Trabalho Mecânico";
    }
}