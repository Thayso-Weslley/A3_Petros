from flask import Blueprint, jsonify
from Lista_Materiais.repositorio_base import RepositorioBase

# Cria o blueprint da rota
repositorio_base_bp = Blueprint('repositorio_base_api', __name__)
repo_base = RepositorioBase()

@repositorio_base_bp.route('/api/materiais/catalogo', methods=['GET'])
def get_catalogo():
    try:
        materiais = repo_base.obter_todos_materiais()
        return jsonify(materiais), 200
    except Exception as e:
        return jsonify({"erro": f"Falha ao carregar catálogo: {str(e)}"}), 500