from flask import Blueprint, request, jsonify

# Importa a classe de negócio do diretório de engenharia
# Nota: Ajuste o caminho do import caso a sua estrutura de pacotes Python exija caminhos relativos ou absolutos diferentes
from Formulas_e_Calculos.engenharia.formula_de_Navier import formula_de_Navier

navier_bp = Blueprint('navier_api', __name__, url_prefix='/api/engenharia/navier')

@navier_bp.route('/calcular', methods=['POST'])
def calcular_navier():
    dados = request.get_json()

    # Extração segura dos parâmetros enviados pelo JavaScript
    momento = dados.get('momento')
    modulo_resistencia = dados.get('modulo_resistencia')
    tensao_escoamento = dados.get('tensao_escoamento')
    coeficiente_seguranca = dados.get('coeficiente_seguranca')

    # Executa o motor híbrido de Verificação / Dimensionamento
    resultado = formula_de_Navier.calcular_formula_de_Navier(
        momento=momento,
        modulo_resistencia=modulo_resistencia,
        tensao_escoamento=tensao_escoamento,
        coeficiente_seguranca=coeficiente_seguranca
    )

    return jsonify(resultado)