import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class lei_de_NewtonUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo da 2° Lei de Newton.
     * @param {Function} ApiCalculoNewton: Função usada para calcular a força resultante, fornecida pela API. 
     */
    constructor(ApiCalculoNewton) {
        super(
            "🧮 2° Lei de Newton",
            [
                { id: "massa", label: "MASSA", si: "Kg", placeholder: "Massa (kg)" },
                { id: "aceleracao", label: "ACELERAÇÃO", si: "m/s²", placeholder: "Aceleração (m/s²)" },
                { id: "forca", label: "FORÇA", si: "N", placeholder: "Força (N)" }
            ],
            ApiCalculoNewton,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.cacheLocal = null;
        this.nomeMenu = "2° Lei de Newton"; // Mantém a propriedade que seu sistema lê
    }
}