import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class energia_cineticaUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Energia Cinética",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "velocidade", label: "VELOCIDADE", si: "m/s", placeholder: "Velocidade (m/s)" },
                { id: "energia", label: "ENERGIA CINÉTICA", si: "J", placeholder: "Energia (J)" }
            ],
            API.dinamica.calcularEnergiaCinetica,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Energia Cinética";
    }
}