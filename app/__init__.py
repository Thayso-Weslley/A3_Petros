# app/__init__.py
from flask import Flask

def create_app():
    # Passamos a configuração das pastas para a fábrica
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    # Importação tardia e registro do Blueprint
    from app.api.dinamica_routes import dinamica_bp
    app.register_blueprint(dinamica_bp)

    return app