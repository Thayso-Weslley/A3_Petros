from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.dinamica.quantidade_de_movimento import Quantidade_De_Movimento

quantidade_de_movimento_bp = Blueprint('quantidade_de_movimento_api', __name__, url_prefix='/api/dinamica')

@quantidade_de_movimento_bp.route('/calcular', methods=['POST'])
def calcular_quantidade_de_movimento():
    dados = request.get_json()

    q = dados.get('q')
    massa = dados.get('massa')
    velocidade = dados.get('velocidade')

    resultado = Quantidade_De_Movimento.calcular_quantidade_de_movimento(q=q, massa= massa, velocidade=velocidade)

    return jsonify(resultado)