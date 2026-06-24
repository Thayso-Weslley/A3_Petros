from flask import Flask, Blueprint, jsonify, request
from Lista_Materiais.repositorio_usuario import Repositorio_Usuario

repositorio_usuario_bp = Blueprint('repositorio_usuario_api', __name__)
repo = Repositorio_Usuario()

# ==========================================
# ROTAS DE LEITURA (READ)
# ==========================================

@repositorio_usuario_bp.route("/api/usuario/listas", methods=["GET"])
def obter_listas():
    """Retorna todas as listas cadastradas pelo usuário no banco de dados."""
    listas = repo.listar_listas_criadas()
    return jsonify(listas), 200

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_lista>/materiais", methods=["GET"])
def obter_materiais_da_lista(nome_lista):
    """Retorna todos os materiais vinculados a uma lista específica."""
    materiais = repo.listar_materiais_da_lista(nome_lista)
    return jsonify(materiais), 200

@repositorio_usuario_bp.route("/api/usuario/materiais", methods=["GET"])
def obter_todos_materiais():
    """Realiza um JOIN no banco e retorna o inventário completo do usuário."""
    todos = repo.listar_todos_materiais_usuario()
    return jsonify(todos), 200

# ==========================================
# ROTAS DE CRIAÇÃO E ALTERAÇÃO (CREATE & UPDATE)
# ==========================================

@repositorio_usuario_bp.route("/api/usuario/listas", methods=["POST"])
def criar_nova_lista():
    """Insere o registro de uma nova lista na tabela 'listas'."""
    dados = request.get_json() or {}
    nome_lista = dados.get("nome_lista")
    
    if not nome_lista:
        return jsonify({"sucesso": False, "erro": "Parâmetro 'nome_lista' é obrigatório."}), 400
        
    resultado = repo.criar_lista(nome_lista)
    status_code = 201 if resultado["sucesso"] else 400
    return jsonify(resultado), status_code

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_lista>/materiais", methods=["POST"])
def salvar_material_na_lista(nome_lista):
    """Insere/Atualiza (UPSERT) um material plano e cria o vínculo com a lista."""
    dados = request.get_json() or {}
    
    # 💡 SALVAGUARDA: Se o front mandou envelopado em 'material', usamos.
    # Se mandou o objeto plano direto no body, 'dados' já é o próprio material.
    if "material" in dados:
        dados_material = dados.get("material")
        nome_anterior = dados.get("nome_anterior")
    else:
        dados_material = dados
        nome_anterior = None 
    
    # Validação segura: verifica se o payload decodificado possui o mínimo (o nome do material)
    if not dados_material or not dados_material.get("nome"):
        return jsonify({
            "sucesso": False, 
            "erro": "O objeto do material ou suas propriedades obrigatórias não foram encontrados no payload."
        }), 400
        
    resultado = repo.adicionar_a_lista(nome_lista, dados_material, nome_anterior)
    status_code = 200 if resultado["sucesso"] else 400
    return jsonify(resultado), status_code

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_antigo>", methods=["PUT"])
def alterar_nome_da_lista(nome_antigo):
    """Modifica a Primary Key da lista, atualizando os vínculos em cascata."""
    dados = request.get_json() or {}
    nome_novo = dados.get("nome_novo")
    
    if not nome_novo:
        return jsonify({"sucesso": False, "erro": "O parâmetro 'nome_novo' é obrigatório."}), 400
        
    resultado = repo.renomear_lista(nome_antigo, nome_novo)
    status_code = 200 if resultado["sucesso"] else 400
    return jsonify(resultado), status_code

# ==========================================
# ROTAS DE EXCLUSÃO (DELETE)
# ==========================================

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_lista>", methods=["DELETE"])
def deletar_lista_inteira(nome_lista):
    """Apaga a lista. Materiais exclusivos dela serão limpos via Garbage Collection no SQLite."""
    resultado = repo.excluir_lista(nome_lista)
    status_code = 200 if resultado["sucesso"] else 400
    return jsonify(resultado), status_code

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_lista>/materiais/<nome_material_ou_id>", methods=["DELETE"])
def deletar_material_da_lista(nome_lista, nome_material_ou_id):
    """Remove o vínculo N:N entre o material e a lista."""
    resultado = repo.excluir_material(nome_lista, nome_material_ou_id)
    status_code = 200 if resultado["sucesso"] else 400
    return jsonify(resultado), status_code

# ==========================================
# ROTA DE COMPARTILHAMENTO (SINC_PARCIAL CROWDSOURCING)
# ==========================================

@repositorio_usuario_bp.route("/api/usuario/listas/<nome_lista>/materiais/<nome_material>/compartilhar", methods=["POST"])
def compartilhar_material_com_central(nome_lista, nome_material):
    """Recupera o registro isolado e simula o envio para a fila de aprovação global."""
    resultado = repo.preparar_para_central(nome_lista, nome_material)
    
    if not resultado["sucesso"]:
        return jsonify(resultado), 400
        
    payload_dados = resultado["payload"]
    
    # 💡 LÓGICA MVP: Integração com a tabela de homologação
    print(f"[CROWDSOURCING] Material '{payload_dados['nome']}' recebido para análise do administrador.")
    
    return jsonify({
        "sucesso": True, 
        "mensagem": f"Material '{nome_material}' enviado com sucesso para a fila de homologação pública."
    }), 200

if __name__ == "__main__":
    # Correção: O Blueprint não roda sozinho. Criamos um app Flask "dummy" apenas para testes rápidos locais.
    app_teste = Flask(__name__)
    app_teste.register_blueprint(repositorio_usuario_bp)
    print("Iniciando ambiente de teste isolado para a API do Usuário...")
    app_teste.run(debug=True, port=5000)