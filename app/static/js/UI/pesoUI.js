import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class pesoUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Força Peso",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "gravidade", label: "GRAVIDADE", si: "m/s²", placeholder: "Gravidade (m/s²)" },
                { id: "peso", label: "PESO (FORÇA)", si: "N", placeholder: "Peso (N)" }
            ],
            API.dinamica.calcularPeso,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Força Peso";
    }
}