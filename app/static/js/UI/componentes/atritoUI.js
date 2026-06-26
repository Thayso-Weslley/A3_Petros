import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class atritoUI extends BaseCalculoUI {
    /**
     * 
     * @param {Function} ApiCalcularAtrito: Função que representa a API para cálculos de física.
     */
    constructor(ApiCalcularAtrito) {
        super(
            "🧮 Cálculo de Força de Atrito",
            [
                { id: "coeficiente", label: "COEFICIENTE DE ATRITO (μ)", si: "-", placeholder: "Coeficiente (Adimensional)" },
                { id: "normal", label: "FORÇA NORMAL (N)", si: "N", placeholder: "Força Normal (N)" },
                { id: "atrito", label: "FORÇA DE ATRITO (Fat)", si: "N", placeholder: "Força de Atrito (N)" }
            ],
            ApiCalcularAtrito,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        this.nomeMenu = "Força de Atrito";
    }
}