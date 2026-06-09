# app/__init__.py
from flask import Flask

def create_app():
    # Passamos a configuração das pastas para a fábrica
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    # Importação tardia e registro do Blueprint
    from app.api.lei_de_Newton_routes import lei_de_Newton_bp
    from app.api.atrito_routes import atrito_bp
    from app.api.energia_cinetica_routes import energia_cinetica_bp
    from app.api.momento_routes import momento_bp
    from app.api.peso_routes import peso_bp
    from app.api.potencia_routes import potencia_bp
    from app.api.quantidade_de_movimento_routes import quantidade_de_movimento_bp
    from app.api.repositorio_base_routes import repositorio_base_bp
    app.register_blueprint(lei_de_Newton_bp)
    app.register_blueprint(atrito_bp)
    app.register_blueprint(energia_cinetica_bp)
    app.register_blueprint(momento_bp)
    app.register_blueprint(peso_bp)
    app.register_blueprint(potencia_bp)
    app.register_blueprint(quantidade_de_movimento_bp)
    app.register_blueprint(repositorio_base_bp)

    return app