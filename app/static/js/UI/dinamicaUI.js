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
        console.log("Renderizando a tela de Dinâmica...");
        containerPrincipal.innerHTML = `
            <h2>🧮 Cálculos de Dinâmica</h2>
            <table class="table">
                <tr style="width: 100%;">
                    <td class="table-label">MASSA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-massa" placeholder="Massa (kg)"></td>
                    <td><button class="table-SI" tabindex="-1">Kg</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">ACELERAÇÃO:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-aceleracao" placeholder="Aceleração (m/s²)"></td>
                    <td><button class="table-SI" tabindex="-1">m/s²</button></td>
                </tr>
                <tr style="height: 60px;">
                    <td class="table-label">FORÇA:</td>
                    <td class="td-input"><input class="table-input" type="number" id="input-forca" placeholder="Força (N)"></td>
                    <td><button class="table-SI" tabindex="-1">N</button></td>
                </tr>
                <tr>
                    <td colspan="3"><button class="table-button-submit" id="btn-enviar-calc">Calcular</button></td>
                </tr>
            </table>
            <p>Deixe em branco o campo que deseja calcular.</p>

            <div id="resultado-container"></div>
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
            
            // 1. Captura os elementos do DOM para usar na leitura e no preenchimento
            const inputMassa = document.getElementById('input-massa');
            const inputAceleracao = document.getElementById('input-aceleracao');
            const inputForca = document.getElementById('input-forca');
            
            // Monta o payload interpretando campos vazios como null (Sua ideia do Solver!)
            const payload = {
                massa: parseFloat(inputMassa.value) || null,
                aceleracao: parseFloat(inputAceleracao.value) || null,
                forca: parseFloat(inputForca.value) || null
            };

            const preenhidos = Object.values(payload).filter(v => v !== null);
            if (preenhidos.length < 2) {
                alert("Por favor, preencha pelo menos dois campos para calcular o terceiro.");
                return;
            }
            if (preenhidos.length > 2) {
                alert("Por favor, deixe um campo em branco para calcular o valor correspondente.");
                return;
            }

            console.log("Payload enviado:")

            // Comunicação com o backend usando o barramento api.js ou fetch direto
            try {
                const response = await fetch('/api/dinamica/calcular', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const dados = await response.json();
                
                // 2. Lógica de Preenchimento Automático
                // O JavaScript checa qual chave veio no objeto de resposta e atualiza o .value do input correspondente
                if (dados.massa !== undefined) {
                    inputMassa.value = dados.massa;
                } else if (dados.aceleracao !== undefined) {
                    inputAceleracao.value = dados.aceleracao;
                } else if (dados.forca !== undefined) {
                    inputForca.value = dados.forca;
                }
                
                // Atualiza também o container de texto inferior para dar o feedback completo
                resContainer.innerHTML = `<strong>Cálculo concluído com sucesso!</strong>`;

            } catch (error) {
                alert("Erro ao conectar com o servidor: ");
                console.error(error);
            }
        });
    }
}