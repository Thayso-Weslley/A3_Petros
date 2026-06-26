import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class pesoUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo da força peso.
     * @param {Function} ApiCalcularPeso: Função usada para calcular a força peso, fornecida pela API. 
     */
    constructor(ApiCalcularPeso) {
        super(
            "🧮 Força Peso",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "gravidade", label: "GRAVIDADE", si: "m/s²", placeholder: "Gravidade (m/s²)" },
                { id: "peso", label: "PESO (FORÇA)", si: "N", placeholder: "Peso (N)" }
            ],
            ApiCalcularPeso,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        this.nomeMenu = "Força Peso";
    }
}