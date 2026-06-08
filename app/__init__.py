# app/__init__.py
from flask import Flask

def create_app():
    # Passamos a configuração das pastas para a fábrica
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    # Importação tardia e registro do Blueprint
    from app.api.lei_de_Newton_routes import lei_de_Newton_bp
    from app.api.repositorio_base_routes import repositorio_base_bp
    app.register_blueprint(lei_de_Newton_bp)
    app.register_blueprint(repositorio_base_bp)

    return app