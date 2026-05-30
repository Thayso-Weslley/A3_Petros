export class menuUI {
    
    render(containerPrincipal) {
        // Injeta o HTML específico desse cálculo na div #screen
        containerPrincipal.innerHTML = `
            <h2>📋 Formulas</h2>

        `;

        // Ativa os Event Listeners DESTA tela específica imediatamente após injetar o HTML
        this.configurarEventos();
    }
}
