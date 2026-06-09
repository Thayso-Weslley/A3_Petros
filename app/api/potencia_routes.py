from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.dinamica.potencia import Potencia

potencia_bp = Blueprint('potencia_api', __name__, url_prefix='api/dinamica')

@potencia_bp.route('/calcular', methods=['POST'])
def calcular_potencia():
    dados = request.get_json()

    potencia = dados.get('potencia')
    trabalho = dados.get('trabalho')
    tempo = dados.get('tempo')

    resultado = Potencia.calcular_potencia(potencia=potencia, trabalho= trabalho, tempo=tempo)

    return jsonify(resultado)