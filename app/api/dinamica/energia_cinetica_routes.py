from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.dinamica.energia_cinetica import Energia_Cinetica

energia_cinetica_bp = Blueprint('energia_cinetica_api', __name__, url_prefix='/api/energia_cinetica')

@energia_cinetica_bp.route('/calcular', methods=['POST'])
def calcular_energia_cinetica():
    dados = request.get_json()

    energia = dados.get('energia')
    massa = dados.get('massa')
    velocidade = dados.get('velocidade')

    resultado = Energia_Cinetica.calcular_energia_cinetica(energia=energia, massa=massa, velocidade=velocidade)

    return jsonify(resultado)