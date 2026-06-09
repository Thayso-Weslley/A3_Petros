from flask import Blueprint, request, jsonify

from Formulas_e_Calculos.estatica.momento import Momento

momento_bp = Blueprint('momento_api', __name__, url_prefix='api/estatica')

@momento_bp.route('/calcular', methods=['POST'])
def calcular_momento():
    dados = request.get_json()

    momento = dados.get('momento')
    forca = dados.get('forca')
    distancia = dados.get('distancia')

    resultado = Momento.calcular_momento(momento=momento, forca=forca, distancia=distancia)

    return jsonify(resultado)