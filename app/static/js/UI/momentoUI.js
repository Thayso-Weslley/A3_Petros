import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class momentoUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Cálculo de Momento (Torque)",
            [
                { id: "forca", label: "FORÇA", si: "N", placeholder: "Força aplicada (N)" },
                { id: "distancia", label: "DISTÂNCIA (BRAÇO)", si: "m", placeholder: "Distância ao ponto (m)" },
                { id: "angulo", label: "ÂNGULO (θ)", si: "°", placeholder: "Ângulo em graus", padrao: 90 },
                { id: "momento", label: "MOMENTO ESTÁTICO", si: "N·m", placeholder: "Momento gerado (N·m)" }
            ],
            API.estatica.calcularMomento,
            "💡 Deixe em branco exatamente o campo que deseja calcular. O ângulo padrão é 90°."
        );
        
        this.nomeMenu = "Momento de uma Força";
    }
}