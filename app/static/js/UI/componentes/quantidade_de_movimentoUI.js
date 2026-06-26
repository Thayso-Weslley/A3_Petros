import { BaseCalculoUI } from '../abstrata/baseCalculoUI.js';

export class quantidade_de_movimentoUI extends BaseCalculoUI {
    /**
     * Objeto da tela de cálculo de quantidade de movimento (momento linear).
     * @param {Function} ApiCalculoQuantidadeMovimento: Função usada para calcular a quantidade de movimento, fornecida pela API.
     */
    constructor(ApiCalculoQuantidadeMovimento) {
        super(
            "🧮 Cálculo de Quantidade de Movimento (Momento Linear)",
            [
                { id: "massa", label: "MASSA (m)", si: "Kg", placeholder: "Massa do corpo (kg)" },
                { id: "velocidade", label: "VELOCIDADE (v)", si: "m/s", placeholder: "Velocidade (m/s)" },
                { id: "quantidade_de_movimento", label: "QUANTIDADE DE MOVIMENTO (Q)", si: "kg·m/s", placeholder: "Quantidade de Movimento (kg·m/s)" }
            ],
            ApiCalculoQuantidadeMovimento,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Quantidade de Movimento";
    }
}