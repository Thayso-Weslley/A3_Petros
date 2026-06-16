# app/__init__.py
from flask import Flask

def create_app():
    # Passamos a configuração das pastas para a fábrica
    app = Flask(__name__, template_folder='templates', static_folder='static')
    
    # CHAVE DE SEGURANÇA: Necessária para criptografar os cookies de sessão (Login)
    app.secret_key = 'engenhapp_secret_key_super_protegida'
    
    # Importação tardia e registro do Blueprint de Autenticação
    from app.api.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # Importação tardia e registro dos demais Blueprints
    from app.api.dinamica.lei_de_Newton_routes import lei_de_Newton_bp
    from app.api.estatica.atrito_routes import atrito_bp
    from app.api.dinamica.energia_cinetica_routes import energia_cinetica_bp
    from app.api.estatica.momento_routes import momento_bp
    from app.api.dinamica.peso_routes import peso_bp
    from app.api.dinamica.potencia_routes import potencia_bp
    from app.api.dinamica.quantidade_de_movimento_routes import quantidade_de_movimento_bp
    from app.api.repositorio_base_routes import repositorio_base_bp
    from app.api.repositorio_usuario_routes import usuario_materiais_bp
    from app.api.dinamica.trabalho_routes import trabalho_bp
    from app.api.engenharia.formula_de_Navier_routes import navier_bp
    from app.api.engenharia.equacao_de_Euler_routes import euler_bp

    # Registro dos Blueprints no App
    app.register_blueprint(lei_de_Newton_bp)
    app.register_blueprint(atrito_bp)
    app.register_blueprint(energia_cinetica_bp)
    app.register_blueprint(momento_bp)
    app.register_blueprint(peso_bp)
    app.register_blueprint(potencia_bp)
    app.register_blueprint(quantidade_de_movimento_bp)
    app.register_blueprint(repositorio_base_bp)
    app.register_blueprint(usuario_materiais_bp if 'usuario_materials_bp' in locals() else usuario_materiais_bp)
    app.register_blueprint(trabalho_bp)
    app.register_blueprint(navier_bp)
    app.register_blueprint(euler_bp)

    return app