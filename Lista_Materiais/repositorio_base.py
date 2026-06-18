import os
import sqlite3

class RepositorioBase:
    def __init__(self):
        self.pasta_lista_materiais = os.path.dirname(os.path.abspath(__file__))
        self.caminho_db = os.path.join(self.pasta_lista_materiais, 'DB_catalogo', 'engenhapp.db')

    def obter_todos_materiais(self, pagina=1, por_pagina=200, ordenar_por="nome", direcao="ASC"):
        """Acessa o banco engenhapp.db aplicando ordenação e paginação nativa"""
        lista_materiais = []

        if not os.path.exists(self.caminho_db):
            return lista_materiais

        try:
            conexao = sqlite3.connect(self.caminho_db)
            conexao.row_factory = sqlite3.Row
            cursor = conexao.cursor()

            # Calcula quantos itens pular com base na página atual
            offset = (pagina - 1) * por_pagina

            # Lista de colunas permitidas para evitar SQL Injection na ordenação
            colunas_validas = [
                "id", "nome", "categoria", "preco", "densidade", 
                "modulo_elasticidade", "coeficiente_poisson", "limite_compressao", 
                "limite_tracao", "limite_cisalhamento", "condutividade_termica", 
                "calor_especifico", "expansao_termica", "ponto_fusao", 
                "condutividade_eletrica", "resistividade"
            ]
            
            # Sanitização estrita do campo de ordenação
            if ordenar_por not in colunas_validas:
                ordenar_por = "nome"
            
            direcao = "DESC" if direcao.upper() == "DESC" else "ASC"

            # Query otimizada com LIMIT e OFFSET (Paginação nativa do SQLite)
            query = f"""
                SELECT * FROM materiais 
                ORDER BY {ordenar_por} {direcao} 
                LIMIT ? OFFSET ?
            """

            cursor.execute(query, (por_pagina, offset))
            linhas = cursor.fetchall()

            for linha in linhas:
                dados_material = dict(linha)
                if dados_material.get('tags'):
                    dados_material['tags'] = [tag.strip() for tag in dados_material['tags'].split(',')]
                else:
                    dados_material['tags'] = []
                    
                lista_materiais.append(dados_material)

            # Query secundária rápida para saber se ainda existem mais itens no banco além deste lote
            cursor.execute("SELECT COUNT(id) FROM materiais")
            total_itens = cursor.fetchone()[0]
            tem_mais = (offset + len(lista_materiais)) < total_itens

            conexao.close()
            return {"itens": lista_materiais, "tem_mais": tem_mais}
            
        except Exception as e:
            print(f"Erro crítico no repositório: {e}")
            return {"itens": [], "tem_mais": False}