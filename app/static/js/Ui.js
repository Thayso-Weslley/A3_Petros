document.addEventListener('DOMContentLoaded', () => {
	const sidebar = document.getElementById('sidebar');
	const toggleBtn = document.getElementById('toggleBtn');
	const screen = document.getElementById('screen');

	function setCollapsed(collapsed) {
		if (collapsed) {
			sidebar.classList.add('collapsed');
			toggleBtn.setAttribute('aria-expanded', 'false');
		} else {
			sidebar.classList.remove('collapsed');
			toggleBtn.setAttribute('aria-expanded', 'true');
		}
	}

	// Inicialmente não colapsado
	let collapsed = false;

	toggleBtn.addEventListener('click', () => {
		collapsed = !collapsed;
		setCollapsed(collapsed);
	});

	// Troca simples de 'telas' preenchendo a div central
	document.querySelectorAll('.screen-link').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const target = e.currentTarget.dataset.screen;
			renderScreen(target);
		});
	});

	function renderScreen(name) {
		if (!screen) return;
		switch (name) {
			case 'settings':
				screen.innerHTML = `<h2>Configurações</h2><p>Aqui vão as opções da sua aplicação.</p>`;
				break;
			case 'about':
				screen.innerHTML = `<h2>Sobre</h2><p>Informações sobre o projeto e autores.</p>`;
				break;
			default:
				screen.innerHTML = `<h2>Home</h2><p>Área central onde as diferentes telas serão renderizadas.</p>`;
				break;
		}
	}
});
