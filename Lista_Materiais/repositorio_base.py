import os
import json

class RepositorioBase:
    def __init__(self):
        # __file__ é "EngenhApp/Lista_Materiais/repositorio_base.py"
        # os.path.dirname(__file__) é "EngenhApp/Lista_Materiais"
        self.pasta_lista_materiais = os.path.dirname(os.path.abspath(__file__))
        
        # Aponta direto para a subpasta catalogo_json sem sair e voltar
        self.pasta_catalogo = os.path.join(self.pasta_lista_materiais, 'catalogo_json')

    def obter_todos_materiais(self):
        """Varre a pasta catalogo_json e retorna uma lista com o conteúdo de todos os JSONs"""
        lista_materiais = []

        if not os.path.exists(self.pasta_catalogo):
            return lista_materiais

        for nome_arquivo in os.listdir(self.pasta_catalogo):
            if nome_arquivo.endswith('.json'):
                caminho_completo = os.path.join(self.pasta_catalogo, nome_arquivo)
                try:
                    with open(caminho_completo, 'r', encoding='utf-8') as arquivo:
                        dados_material = json.load(arquivo)
                        lista_materiais.append(dados_material)
                except Exception as e:
                    print(f"Erro ao ler o arquivo {nome_arquivo}: {e}")
                    
        return lista_materiais