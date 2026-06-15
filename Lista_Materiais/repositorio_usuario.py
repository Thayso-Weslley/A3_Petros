# Lista_Materiais/repositorio_usuario.py

import os
import json
from pathlib import Path

class RepositorioUsuario:
    def __init__(self):
        self.raiz_inventario = Path(__file__).parent / "inventario_usuario"
        self._garantir_diretorio_raiz()

    def _garantir_diretorio_raiz(self):
        self.raiz_inventario.mkdir(parents=True, exist_ok=True)

    def listar_listas_criadas(self):
        """Varre o diretório e retorna o nome de todas as subpastas (listas do usuário)."""
        try:
            return [
                nome for nome in os.listdir(self.raiz_inventario)
                if (self.raiz_inventario / nome).is_dir()
            ]
        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Erro ao listar pastas de inventário: {e}")
            return []

    def adicionar_a_lista(self, nome_lista, dados_material):
        """
        Salva o material na subpasta escolhida mantendo fielmente a estrutura rica 
        e aninhada do catálogo JSON original (com metadados, mecânicas, térmicas, etc).
        """
        try:
            nome_lista_limpo = nome_lista.strip()
            pasta_destino = self.raiz_inventario / nome_lista_limpo
            pasta_destino.mkdir(parents=True, exist_ok=True)

            nome_material = dados_material.get("nome", "Material_Sem_Nome").strip()
            
            # Montamos o clone mantendo o espelhamento exato do seu objeto de exemplo
            material_final = {
                "id": dados_material.get("id"), # Mantém o ID original ou vira string dinamicamente no front
                "nome": nome_material,
                "categoria": dados_material.get("categoria", "Geral"),
                "status": "Lista Pessoal",
                "lista_origem": nome_lista_limpo,
                
                # Preserva o bloco de metadados se existir, ou cria um esqueleto padrão
                "metadados": dados_material.get("metadados", {
                    "data_adicao": "2026-06-14", # Data atual
                    "fonte_referencia": "Inventário Customizado do Usuário",
                    "tags": []
                }),
                
                # Mapeamento profundo das subestruturas físicas
                "propriedades_mecanicas": dados_material.get("propriedades_mecanicas", {}),
                "propriedades_termicas": dados_material.get("propriedades_termicas", {}),
                "propriedades_eletricas": dados_material.get("propriedades_eletricas", {})
            }

            # Sanitização do nome do arquivo (Ex: "Carbeto de Silício (SiC)" -> "Carbeto_de_Silicio__SiC_.json")
            nome_arquivo = "".join([c if c.isalnum() or c in "._-" else "_" for c in nome_material]) + ".json"
            caminho_arquivo = pasta_destino / nome_arquivo

            # Escrita do JSON identado com UTF-8 para manter os acentos e símbolos (m³, GPa, etc.)
            with open(caminho_arquivo, "w", encoding="utf-8") as f:
                json.dump(material_final, f, indent=4, ensure_ascii=False)

            return {"sucesso": True, "mensagem": f"'{nome_material}' salvo com sucesso em '{nome_lista_limpo}'."}

        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Falha ao salvar arquivo JSON estruturado: {e}")
            return {"sucesso": False, "erro": str(e)}

    def listar_todos_materiais_usuario(self):
        """Varre as subpastas, lê os JSONs aninhados e monta a lista para o front-end."""
        todos_materiais = []
        try:
            for pasta in self.raiz_inventario.iterdir():
                if pasta.is_dir():
                    for arquivo in pasta.glob("*.json"):
                        try:
                            with open(arquivo, "r", encoding="utf-8") as f:
                                dados = json.load(f)
                                # Injeta a referência física do arquivo para facilitar futuras deleções
                                dados["id_arquivo"] = f"{pasta.name}/{arquivo.name}"
                                todos_materiais.append(dados)
                        except Exception as file_err:
                            print(f"[REPOSITÓRIO WARNING] Falha ao ler arquivo {arquivo.name}: {file_err}")
            return todos_materiais
        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Erro ao varrer inventário geral: {e}")
            return []