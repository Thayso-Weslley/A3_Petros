import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class energia_cineticaUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo de energia cinética.
     * @param {Function} ApiCalculoEnergiaCinetica: Função usada para calcular a energia cinética, fornecida pela API. 
     */
    constructor(ApiCalculoEnergiaCinetica) {
        super(
            "🧮 Energia Cinética",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "velocidade", label: "VELOCIDADE", si: "m/s", placeholder: "Velocidade (m/s)" },
                { id: "energia", label: "ENERGIA CINÉTICA", si: "J", placeholder: "Energia (J)" }
            ],
            ApiCalculoEnergiaCinetica,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Energia Cinética";
    }
}