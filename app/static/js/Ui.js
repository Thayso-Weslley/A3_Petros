// UI.js
export const CoreUI = {
    setupSidebarToggle: (sidebar, toggleBtn) => {
        if (!sidebar || !toggleBtn) return;
        let collapsed = false;
        
        toggleBtn.addEventListener('click', () => {
            collapsed = !collapsed;
            if (collapsed) {
                sidebar.classList.add('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                sidebar.classList.remove('collapsed');
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        });
    },

    renderizarListaDinamica: (listaDinamica, screen, chavesAtivas, componentes) => {
        if (!listaDinamica) return;
        listaDinamica.innerHTML = ''; 

        chavesAtivas.forEach(chave => {
            const comp = componentes[chave];
            if (!comp) return;

            const li = document.createElement('li');
            li.className = 'sidebar-item-container'; 

            const btnLink = document.createElement('button');
            btnLink.className = 'screen-link';
            btnLink.dataset.screen = chave;
            btnLink.innerText = comp.nomeMenu; 
            btnLink.addEventListener('click', () => comp.render(screen));

            li.appendChild(btnLink);

            const criarBotaoExcluir = () => {
                if (li.querySelector('.sidebar-btn-delete')) return;

                const btnDelete = document.createElement('button');
                btnDelete.className = 'sidebar-btn-delete';
                btnDelete.innerHTML = '&times;'; 
                btnDelete.title = `Remover ${comp.nomeMenu}`;
                btnDelete.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    window.EngenhApp.removerModulo(chave);
                });

                li.appendChild(btnDelete);
            };

            const removerBotaoExcluir = () => {
                const btnExistente = li.querySelector('.sidebar-btn-delete');
                if (btnExistente) btnExistente.remove();
            };

            li.addEventListener('mouseenter', criarBotaoExcluir);
            li.addEventListener('mouseleave', removerBotaoExcluir);
            li.addEventListener('focusin', criarBotaoExcluir);
            li.addEventListener('focusout', removerBotaoExcluir);

            listaDinamica.appendChild(li); 
        });
    },

    // Mantendo apenas o que realmente é tratado de forma genérica/estática aqui
    renderScreenFixo: (screen, name) => {
        if (!screen) return;
        switch (name) {
            case 'buscar-formula':
                screen.innerHTML = `<h2>Buscar Fórmula</h2><p>Painel de busca global.</p>`;
                break;
            default:
                screen.innerHTML = `<h2>Home</h2><p>Selecione uma opção.</p>`;
                break;
        }
    }
};