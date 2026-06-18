import os
import json
import shutil
from pathlib import Path
from datetime import datetime

class RepositorioUsuario:
    def __init__(self):
        self.raiz_inventario = Path(__file__).parent / "inventario_usuario"
        self._garantir_diretorio_raiz()

    def _garantir_diretorio_raiz(self):
        self.raiz_inventario.mkdir(parents=True, exist_ok=True)

    # ==========================================
    # C - CREATE & U - UPDATE (MATERIAIS)
    # ==========================================
    def adicionar_a_lista(self, nome_lista, dados_material):
        """Cria ou atualiza (Modo Edição) um material dentro de uma pasta específica."""
        try:
            nome_lista_limpo = nome_lista.strip()
            pasta_destino = self.raiz_inventario / nome_lista_limpo
            pasta_destino.mkdir(parents=True, exist_ok=True)

            nome_material = dados_material.get("nome", "Material_Sem_Nome").strip()
            
            # Monta ou reconstrói a estrutura rica do JSON
            material_final = {
                "id": dados_material.get("id"),
                "nome": nome_material,
                "categoria": dados_material.get("categoria", "Geral"),
                "status": dados_material.get("status", "Lista Pessoal"),
                "lista_origem": nome_lista_limpo,
                
                "metadados": {
                    "data_adicao": dados_material.get("data_adicao") or datetime.now().strftime("%Y-%m-%d"),
                    "fonte_referencia": dados_material.get("fonte_referencia", "Inventário Customizado do Usuário"),
                    "tags": dados_material.get("tags", [])
                },
                
                "propriedades_mecanicas": dados_material.get("propriedades_mecanicas", {}),
                "propriedades_termicas": dados_material.get("propriedades_termicas", {}),
                "propriedades_eletricas": dados_material.get("propriedades_eletricas", {})
            }

            # Garante que não salvaremos dicionários aninhados vazios se o usuário limpar os campos
            for bloco in ["propriedades_mecanicas", "propriedades_termicas", "propriedades_eletricas"]:
                if bloco in material_final:
                    material_final[bloco] = {
                        k: v for k, v in material_final[bloco].items() if v.get("valor") is not None
                    }

            # Sanitização estrita do nome do arquivo
            nome_arquivo = "".join([c if c.isalnum() or c in "._-" else "_" for c in nome_material]) + ".json"
            caminho_arquivo = pasta_destino / nome_arquivo

            with open(caminho_arquivo, "w", encoding="utf-8") as f:
                json.dump(material_final, f, indent=4, ensure_ascii=False)

            return {"sucesso": True, "mensagem": f"'{nome_material}' processado com sucesso em '{nome_lista_limpo}'."}

        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Falha ao salvar/editar material: {e}")
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # R - READ (LISTAS E ARQUIVOS)
    # ==========================================
    def listar_listas_criadas(self):
        """Retorna o nome de todas as subpastas (as listas do usuário)."""
        try:
            return [
                nome for nome in os.listdir(self.raiz_inventario)
                if (self.raiz_inventario / nome).is_dir()
            ]
        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Erro ao listar pastas: {e}")
            return []

    def listar_materiais_da_lista(self, nome_lista):
        """Retorna todos os materiais contidos exclusivamente dentro de UMA lista/pasta."""
        materiais = []
        pasta_alvo = self.raiz_inventario / nome_lista.strip()
        
        if not pasta_alvo.exists() or not pasta_alvo.is_dir():
            return materiais

        try:
            for arquivo in pasta_alvo.glob("*.json"):
                try:
                    with open(arquivo, "r", encoding="utf-8") as f:
                        dados = json.load(f)
                        # O 'id_arquivo' encapsula 'nome_da_pasta/nome_do_arquivo.json'
                        dados["id_arquivo"] = f"{pasta_alvo.name}/{arquivo.name}"
                        materiais.append(dados)
                except Exception as file_err:
                    print(f"[REPOSITÓRIO WARNING] Falha ao ler {arquivo.name}: {file_err}")
            return materiais
        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Erro ao listar materiais da pasta {nome_lista}: {e}")
            return []

    def listar_todos_materiais_usuario(self):
        """Varre o inventário completo (todas as pastas) de uma vez só."""
        todos_materiais = []
        try:
            for nome_pasta in self.listar_listas_criadas():
                todos_materiais.extend(self.listar_materiais_da_lista(nome_pasta))
            return todos_materiais
        except Exception as e:
            print(f"[REPOSITÓRIO ERROR] Erro ao varrer inventário geral: {e}")
            return []

    # ==========================================
    # U - UPDATE (GERENCIAMENTO DE PASTAS)
    # ==========================================
    def renomear_lista(self, nome_antigo, nome_novo):
        """Altera o nome de uma subpasta no disco e atualiza as referências internas dos JSONs."""
        try:
            caminho_antigo = self.raiz_inventario / nome_antigo.strip()
            caminho_novo = self.raiz_inventario / nome_novo.strip()

            if not caminho_antigo.exists():
                return {"sucesso": False, "erro": "A pasta de origem não existe."}
            if caminho_novo.exists():
                return {"sucesso": False, "erro": "Já existe uma lista com o novo nome escolhido."}

            # Executa o rename no Sistema Operacional
            caminho_antigo.rename(caminho_novo)

            # Atualiza o campo 'lista_origem' dentro dos arquivos para manter a integridade dos dados
            for arquivo in caminho_novo.glob("*.json"):
                try:
                    with open(arquivo, "r+", encoding="utf-8") as f:
                        dados = json.load(f)
                        dados["lista_origem"] = nome_novo.strip()
                        f.seek(0)
                        json.dump(dados, f, indent=4, ensure_ascii=False)
                        f.truncate()
                except Exception as json_err:
                    print(f"[REPOSITÓRIO WARNING] Falha ao atualizar meta interno de {arquivo.name}: {json_err}")

            return {"sucesso": True, "mensagem": f"Lista alterada de '{nome_antigo}' para '{nome_novo}'."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # D - DELETE (PASTAS E ARQUIVOS)
    # ==========================================
    def excluir_material(self, nome_lista, nome_arquivo):
        """Remove um arquivo .json específico de uma pasta."""
        try:
            caminho_arquivo = self.raiz_inventario / nome_lista.strip() / nome_arquivo.strip()
            if caminho_arquivo.exists() and caminho_arquivo.is_file():
                caminho_arquivo.unlink() # Deleta o arquivo físico
                return {"sucesso": True, "mensagem": f"Material '{nome_arquivo}' removido com sucesso."}
            return {"sucesso": False, "erro": "Arquivo não encontrado no diretório do usuário."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    def excluir_lista(self, nome_lista):
        """Remove a pasta inteira e todos os JSONs contidos nela (shutil.rmtree)."""
        try:
            caminho_pasta = self.raiz_inventario / nome_lista.strip()
            if caminho_pasta.exists() and caminho_pasta.is_dir():
                shutil.rmtree(caminho_pasta) # Remove diretório recursivamente
                return {"sucesso": True, "mensagem": f"A lista '{nome_lista}' e todos os seus itens foram apagados."}
            return {"sucesso": False, "erro": "Lista não encontrada."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # FLUXO DE SINCRONIZAÇÃO CENTRAL (CROWDSOURCING)
    # ==========================================
    def preparar_para_central(self, nome_lista, nome_arquivo):
        """
        Lê o arquivo local do usuário e extrai o dicionário limpo e validado.
        Esse retorno será capturado pela rota do Flask para ser injetado 
        na tabela de 'sugestoes' ou 'analises' do seu banco SQLite global.
        """
        try:
            caminho_arquivo = self.raiz_inventario / nome_lista.strip() / nome_arquivo.strip()
            if not caminho_arquivo.exists():
                return {"sucesso": False, "erro": "Material local não encontrado para submissão."}

            with open(caminho_arquivo, "r", encoding="utf-8") as f:
                dados_originais = json.load(f)

            # Retorna o payload estruturado pronto para a rota despachar para o banco SQLite central
            return {"sucesso": True, "payload": dados_originais}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}