import { BaseCalculoUI } from './abstrata/baseCalculoUI.js';
import { API } from '../api.js';

export class trabalhoUI extends BaseCalculoUI {
    constructor() {
        super(
            "🧮 Cálculo de Trabalho Mecânico",
            [
                { id: "forca", label: "FORÇA (F)", si: "N", placeholder: "Força aplicada (N)" },
                { id: "distancia", label: "DESLOCAMENTO (d)", si: "m", placeholder: "Distância percorrida (m)" },
                { id: "trabalho", label: "TRABALHO REALIZADO (W)", si: "J", placeholder: "Trabalho gerado (J)" }
            ],
            API.dinamica.calcularTrabalho,
            "💡 Deixe em branco exatamente o campo que deseja calcular."
        );
        
        this.nomeMenu = "Trabalho Mecânico";
    }
}