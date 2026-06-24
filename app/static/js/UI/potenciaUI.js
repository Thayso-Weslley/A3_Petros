import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class potenciaUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Cálculo de Potência Mecânica",
            [
                { id: "trabalho", label: "TRABALHO (W)", si: "J", placeholder: "Trabalho realizado (J)" },
                { id: "tempo", label: "TEMPO (Δt)", si: "s", placeholder: "Intervalo de tempo (s)" },
                { id: "potencia", label: "POTÊNCIA (P)", si: "W", placeholder: "Potência gerada (W)" }
            ],
            API.dinamica.calcularPotencia,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Potência Mecânica";
    }
}