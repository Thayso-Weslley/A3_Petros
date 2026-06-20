import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class atritoUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Cálculo de Força de Atrito",
            [
                { id: "coeficiente", label: "COEFICIENTE DE ATRITO (μ)", si: "-", placeholder: "Coeficiente (Adimensional)" },
                { id: "normal", label: "FORÇA NORMAL (N)", si: "N", placeholder: "Força Normal (N)" },
                { id: "atrito", label: "FORÇA DE ATRITO (Fat)", si: "N", placeholder: "Força de Atrito (N)" }
            ],
            API.estatica.calcularAtrito,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Força de Atrito";
    }
}