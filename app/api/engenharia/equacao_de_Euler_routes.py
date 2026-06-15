from flask import Blueprint, request, jsonify

# Importa a classe de negócio isolada do diretório de engenharia
from Formulas_e_Calculos.engenharia.equacao_de_Euler import equacao_de_Euler

euler_bp = Blueprint('euler_api', __name__, url_prefix='/api/engenharia/equacao_de_Euler')

@euler_bp.route('/calcular', methods=['POST'])
def calcular_euler():
    dados = request.get_json()

    # Extração segura de todas as variáveis do projeto estrutural
    carga_atuante = dados.get('carga_atuante')
    modulo_elasticidade = dados.get('modulo_elasticidade')
    momento_inercia = dados.get('momento_inercia')
    comprimento = dados.get('comprimento')
    tipo_fixacao = dados.get('tipo_fixacao')  # String: 'biarticulada', 'biengastada', etc.
    coeficiente_seguranca = dados.get('coeficiente_seguranca')

    # Executa o motor de Verificação / Dimensionamento de Flambagem
    resultado = equacao_de_Euler.calcular_equacao_de_Euler(
        carga_atuante=carga_atuante,
        modulo_elasticidade=modulo_elasticidade,
        momento_inercia=momento_inercia,
        comprimento=comprimento,
        tipo_fixacao=tipo_fixacao,
        coeficiente_seguranca=coeficiente_seguranca
    )

    return jsonify(resultado)