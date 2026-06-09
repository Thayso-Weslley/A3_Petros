from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.dinamica.trabalho import Trabalho

trabalho_bp = Blueprint('trabalho_api', __name__, url_prefix='/api/trabalho')

@trabalho_bp.route('/calcular', methods=['POST'])
def calcular_trabalho():
    dados = request.get_json()

    trabalho = dados.get('trabalho')
    forca = dados.get('forca')
    distancia = dados.get('distancia')

    resultado = Trabalho.calcular_trabalho(trabalho=trabalho, forca=forca, distancia=distancia)

    return jsonify(resultado)