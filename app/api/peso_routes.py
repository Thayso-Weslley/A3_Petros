from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.dinamica.peso import Peso

peso_bp = Blueprint('peso_api', __name__, url_prefix='/api/dinamica')

@peso_bp.route('/calcular', methods=['POST'])
def calcular_peso():
    dados = request.get_json()

    peso = dados.get('peso')
    massa = dados.get('massa')
    gravidade = dados.get('gravidade')

    resultado = Peso.calcular_peso(peso=peso, massa=massa, gravidade=gravidade)

    return jsonify(resultado)