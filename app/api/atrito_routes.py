from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.estatica.atrito import Atrito

atrito_bp = Blueprint('atrito_api', __name__, url_prefix='api/estatica')

@atrito_bp.route('/calcular', methods=['POST'])
def calcular_atrito():
    dados = request.get_json()

    atrito = dados.get('atrito')
    coeficiente = dados.get('coeficiente')
    normal = dados.get('normal')

    resultado = Atrito.calcular_atrito(atrito=atrito, coeficiente=coeficiente, normal=normal)

    return jsonify(resultado)