import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class lei_de_NewtonUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 2° Lei de Newton",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "aceleracao", label: "ACELERAÇÃO", si: "m/s²", placeholder: "Aceleração (m/s²)" },
                { id: "forca", label: "FORÇA", si: "N", placeholder: "Força (N)" }
            ],
            API.dinamica.calcularSegundaLei,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.cacheLocal = null;
        this.nomeMenu = "2° Lei de Newton"; // Mantém a propriedade que seu sistema lê
    }
}