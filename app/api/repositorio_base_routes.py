from flask import Blueprint, jsonify, request
from Lista_Materiais.repositorio_base import RepositorioBase

# Cria o blueprint da rota
repositorio_base_bp = Blueprint('repositorio_base_api', __name__)
repo_base = RepositorioBase()

@repositorio_base_bp.route('/api/materiais/catalogo', methods=['GET'])
def get_catalogo():
    try:
        # Captura os parâmetros da URL enviados pelo Front-end (com valores padrão caso omitidos)
        pagina = int(request.args.get('page', 1))
        por_pagina = int(request.args.get('per_page', 200))
        ordenar_por = request.args.get('sort_by', 'nome')
        direcao = request.args.get('direction', 'ASC')

        # Busca o lote específico de materiais no banco
        resultado = repo_base.obter_todos_materiais(
            pagina=pagina,
            por_pagina=por_pagina,
            ordenar_por=ordenar_por,
            direcao=direcao
        )
        
        # Retorna o JSON contendo o array fatiado e o booleano 'tem_mais' para o scroll infinito
        return jsonify(resultado), 200

    except ValueError:
        return jsonify({"erro": "Parâmetros de paginação inválidos (devem ser inteiros)."}), 400
    except Exception as e:
        return jsonify({"erro": f"Falha ao carregar catálogo: {str(e)}"}), 500