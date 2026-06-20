// app/static/js/UI/baseUI.js
export class BaseUI {

    constructor() { this.container = null; }

    async render(container, dados = {}) {
        this.container = container;
        this.container.innerHTML = this.template(dados);
        await this.aposRenderizar(dados);
    }
    
    template() { throw new Error("Implemente o template"); }
    async aposRenderizar() { throw new Error("Implemente o aposRenderizar"); }
    $(seletor) { return this.container.querySelector(seletor); }
}