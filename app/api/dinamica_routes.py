# app/api/dinamica_routes.py
from flask import Blueprint, request, jsonify
# Importamos a classe de lógica pura
from Formulas_e_Calculos.dinamica.lei_de_Newton import lei_de_Newton

# Criamos o Blueprint. O primeiro argumento é o nome interno, e url_prefix agrupa as rotas
dinamica_bp = Blueprint('dinamica_api', __name__, url_prefix='/api/dinamica')

@dinamica_bp.route('/calcular', methods=['POST'])
def calcular_dinamica():
    dados = request.get_json() # Captura o JSON enviado pelo JS
    
    # Extrai os dados que vieram do front-end
    forca = dados.get('forca')
    massa = dados.get('massa')
    aceleracao = dados.get('aceleracao')
    
    # Chama a classe puramente matemática usando os dados recebidos
    resultado = lei_de_Newton.segunda_lei(forca=forca, massa=massa, aceleracao=aceleracao)
    
    # Devolve a resposta estruturada em JSON para o front-end
    return jsonify(resultado)