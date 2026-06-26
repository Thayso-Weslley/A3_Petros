import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class potenciaUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo de potência mecânica.
     * @param {Function} ApiCalculoPotencia: Função usada para calcular a potência, fornecida pela API.
     */
    constructor(ApiCalculoPotencia) {
        super(
            "🧮 Cálculo de Potência Mecânica",
            [
                { id: "trabalho", label: "TRABALHO (W)", si: "J", placeholder: "Trabalho realizado (J)" },
                { id: "tempo", label: "TEMPO (Δt)", si: "s", placeholder: "Intervalo de tempo (s)" },
                { id: "potencia", label: "POTÊNCIA (P)", si: "W", placeholder: "Potência gerada (W)" }
            ],
            ApiCalculoPotencia,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Potência Mecânica";
    }
}