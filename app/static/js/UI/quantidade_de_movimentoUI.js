import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class quantidade_de_movimentoUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Cálculo de Quantidade de Movimento (Momento Linear)",
            [
                { id: "massa", label: "MASSA (m)", si: "Kg", placeholder: "Massa do corpo (kg)" },
                { id: "velocidade", label: "VELOCIDADE (v)", si: "m/s", placeholder: "Velocidade (m/s)" },
                { id: "quantidade_de_movimento", label: "QUANTIDADE DE MOVIMENTO (Q)", si: "kg·m/s", placeholder: "Quantidade de Movimento (kg·m/s)" }
            ],
            API.dinamica.calcularQuantidadeMovimento,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Quantidade de Movimento";
    }
}