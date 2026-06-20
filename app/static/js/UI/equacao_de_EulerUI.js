import { BaseCalculoUI } from './baseCalculoUI.js';
import { API } from '../api.js';

export class equacao_de_EulerUI extends BaseCalculoUI {
    constructor() {
        super(
            "🪵 Equação de Euler (Flambagem)",
            [
                { id: "elasticidade", label: "MOD. ELASTICIDADE", si: "GPa", placeholder: "E (GPa)" },
                { id: "inercia", label: "MOMENTO INÉRCIA", si: "m⁴", placeholder: "I (m⁴)" },
                { id: "comprimento", label: "COMPRIMENTO", si: "m", placeholder: "L (m)" },
                { id: "carga", label: "CARGA APLICADA", si: "kN", placeholder: "P (kN) - Opcional" }
            ],
            API.engenharia.calcularEuler,
            { exigirUmVazio: false } // Permite rodar com tudo preenchido (verificação de segurança)
        );

        this.cacheLocal = null;
        this.nomeMenu = "Equação de Euler (Flambagem)";
    }
}