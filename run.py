# run.py
from flask import render_template
from app import create_app  # Importa a fábrica do diretório app

# Cria o app usando a fábrica (que já vem com o Blueprint registrado)
app = create_app()

# Mantém a sua rota principal para carregar o Front-end
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Print de depuração para você ver as rotas no terminal ao iniciar
    print("\n=== ROTAS ATIVAS NO SERVIDOR ===")
    for rule in app.url_map.iter_rules():
        print(f"Rota: {rule}")
    print("================================\n")

    app.run(debug=True, port=5000)