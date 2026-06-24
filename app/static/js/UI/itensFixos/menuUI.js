export class menuUI {
    // Recebe o dicionário completo de componentes do main.js
    static abrirModal(componentes) {
        // 1. Evita abrir múltiplos modais
        if (document.querySelector('.modal-overlay')) return;

        // 2. Cria o Overlay e o Container
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const container = document.createElement('div');
        container.className = 'modal-container';

        // 3. Monta a Barra de Pesquisa
        const searchBar = document.createElement('div');
        searchBar.className = 'modal-search-bar';
        searchBar.innerHTML = `
            <span class="modal-search-icon">🔎</span>
            <input type="text" class="modal-search-input" placeholder="Buscar fórmula ou módulo..." autofocus>
        `;

        // 4. Monta a Lista de Itens
        const listContainer = document.createElement('ul');
        listContainer.className = 'modal-list';

        // Função interna para renderizar/filtrar os itens
        const renderizarItens = (filtro = '') => {
            listContainer.innerHTML = ''; // Limpa a lista
            const modulosAtivos = window.EngenhApp.obterModulosAtivos();

            // Transforma o objeto 'componentes' num array e filtra pelo texto
            Object.entries(componentes).forEach(([chave, comp]) => {
                const nome = comp.nomeMenu || chave;
                
                // Se o filtro não bater com o nome (ignorando maiúsculas), pula pro próximo
                if (!nome.toLowerCase().includes(filtro.toLowerCase())) return;

                const li = document.createElement('li');
                li.className = 'modal-list-item';
                li.innerText = nome;

                // Checa se o módulo já está na sidebar
                if (modulosAtivos.includes(chave)) {
                    li.classList.add('ativo');
                    li.innerText += ' (Já adicionado)';
                } else {
                    // Só adiciona evento de clique se não estiver ativo
                    li.addEventListener('click', () => {
                        window.EngenhApp.adicionarModulo(chave);
                        fecharModal(); // Fecha após adicionar
                    });
                }
                listContainer.appendChild(li);
            });
        };

        // 5. Configura o evento de digitação (Filtro em tempo real)
        const inputBusca = searchBar.querySelector('.modal-search-input');
        inputBusca.addEventListener('input', (e) => {
            renderizarItens(e.target.value);
        });

        // 6. Configura o fechamento do modal ao clicar fora dele (no overlay escuro)
        const fecharModal = () => overlay.remove();
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModal(); 
        });

        // 7. Monta tudo na tela
        container.appendChild(searchBar);
        container.appendChild(listContainer);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Renderiza a lista completa a primeira vez
        renderizarItens();
        
        // Foca automaticamente no input para o usuário já sair digitando
        setTimeout(() => inputBusca.focus(), 10);
    }
}