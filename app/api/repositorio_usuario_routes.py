# Lista_Materiais/repositorio_usuario_routes.py

from flask import Blueprint, request, jsonify
from Lista_Materiais.repositorio_usuario import RepositorioUsuario

usuario_materiais_bp = Blueprint('usuario_materiais_api', __name__, url_prefix='/api/materiais/usuario')
repo_usuario = RepositorioUsuario()

@usuario_materiais_bp.route('/listas', methods=['GET'])
def obter_pastas_listas():
    """Retorna os nomes de todas as pastas existentes dentro de 'inventario_usuario'."""
    listas = repo_usuario.listar_listas_criadas()
    return jsonify(listas), 200


@usuario_materiais_bp.route('/adicionar', methods=['POST'])
def adicionar_material_na_pasta():
    """
    Recebe o payload contendo o nome da lista (pasta) e o objeto do material.
    Cria o diretório se necessário e grava o JSON.
    """
    dados_requisicao = request.get_json() or {}
    
    nome_lista = dados_requisicao.get("nome_lista")
    material = dados_requisicao.get("material")

    if not nome_lista or not material:
        return jsonify({"sucesso": False, "erro": "Parâmetros 'nome_lista' e 'material' são obrigatórios."}), 400

    resultado = repo_usuario.adicionar_a_lista(nome_lista, material)
    
    if resultado.get("sucesso"):
        return jsonify(resultado), 201
    return jsonify(resultado), 500


@usuario_materiais_bp.route('/listar-todos', methods=['GET'])
def obter_todos_materiais_pessoais():
    """Retorna todos os arquivos JSON mapeados em todas as subpastas unificados."""
    materiais = repo_usuario.listar_todos_materiais_usuario()
    return jsonify(materiais), 200