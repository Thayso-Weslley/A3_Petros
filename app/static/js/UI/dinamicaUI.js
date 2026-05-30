// import { request } from '../api.js'; // Caso queira usar o manipulador central de fetch

export class DinamicaUI {

    constructor() {
        // Você pode inicializar variáveis de estado internas do componente aqui se precisar
        this.cacheLocal = null;
    }

    // Propriedade para o nome do menu, usada na geração da sidebar
    nomeMenu = "🧮 Dinâmica";

    // O método que o seu main.js vai chamar dinamicamente
    render(containerPrincipal) {
        // Injeta o HTML específico desse cálculo na div #screen
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculos de Dinâmica</h2>
            <table class="table">
                <tr>
                    <td class="table-label">Força:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-forca" placeholder="Força (N)"></td>
                </tr>
                <tr>
                    <td class="table-label">Massa:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa" placeholder="Massa (kg)"></td>
                </tr>
                <tr>
                    <td class="table-label">Aceleração:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-aceleracao" placeholder="Aceleração (m/s²)"></td>
                </tr>
                <tr>
                    <td colspan="2"><button class="table-button-submit" id="btn-enviar-calc">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>
        `;

        // Ativa os Event Listeners DESTA tela específica imediatamente após injetar o HTML
        this.configurarEventos();
    }

    configurarEventos() {
        const btn = document.getElementById('btn-enviar-calc');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            // teste de envio
            console.log("Botão de cálculo clicado! Preparando dados...");
            
            const resContainer = document.getElementById('resultado-container');
            
            // Monta o payload interpretando campos vazios como null (Sua ideia do Solver!)
            const payload = {
                forca: parseFloat(document.getElementById('input-forca').value) || null,
                massa: parseFloat(document.getElementById('input-massa').value) || null,
                aceleracao: parseFloat(document.getElementById('input-aceleracao').value) || null
            };

            resContainer.innerText = "Enviando cálculo para o servidor Python...";

            // Comunicação com o backend usando o barramento api.js ou fetch direto
            try {
                const response = await fetch('/api/dinamica/calcular', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const dados = await response.json();
                
                resContainer.innerHTML = `<strong>Resultado:</strong> ${JSON.stringify(dados)}`;
            } catch (error) {
                resContainer.innerText = "Erro ao conectar com o servidor.";
            }
        });
    }
}