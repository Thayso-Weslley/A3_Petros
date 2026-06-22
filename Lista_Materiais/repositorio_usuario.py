import sqlite3
from pathlib import Path
from datetime import datetime

class Repositorio_Usuario:
    def __init__(self):
        # Define o caminho do banco de dados na subpasta 'Inventario_usuario'
        self.db_path = Path(__file__).parent / "Inventario_usuario" / "inventario_usuario.db"
        
        # Garante a criação automática do diretório caso não exista
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._inicializar_banco()

    def _conectar(self):
        """Abre uma conexão com o SQLite e ativa o suporte a chaves estrangeiras."""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.row_factory = sqlite3.Row
        return conn

    def _inicializar_banco(self):
        """Cria a estrutura de tabelas relacionais do usuário mapeando o novo catálogo plano."""
        with self._conectar() as conn:
            # 1. Tabela que armazena as Listas (Pastas)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS listas (
                    nome TEXT PRIMARY KEY
                );
            """)

            # 2. Tabela de Cópia Física (Expandida com os novos campos do catálogo de engenharia)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS materiais (
                    id TEXT PRIMARY KEY,
                    nome TEXT NOT NULL,
                    categoria TEXT NOT NULL,
                    status TEXT NOT NULL,
                    data_adicao TEXT,
                    fonte_referencia TEXT,
                    
                    -- Propriedades Mecânicas (Planificadas)
                    densidade REAL,
                    modulo_elasticidade REAL,
                    coeficiente_poisson REAL,
                    limite_compressao REAL,
                    limite_tracao REAL,
                    limite_cisalhamento REAL,
                    
                    -- Propriedades Térmicas (Planificadas)
                    condutividade_termica REAL,
                    calor_especifico REAL,
                    expansao_termica REAL,
                    ponto_fusao REAL,
                    
                    -- Propriedades Elétricas (Planificadas)
                    condutividade_eletrica REAL,
                    resistividade REAL,
                    
                    -- Tags
                    tags TEXT
                );
            """)

            # 3. Tabela de Referência Associativa (N:N)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS lista_materiais (
                    nome_lista TEXT,
                    id_material TEXT,
                    PRIMARY KEY (nome_lista, id_material),
                    FOREIGN KEY (nome_lista) REFERENCES listas(nome) ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY (id_material) REFERENCES materiais(id) ON DELETE CASCADE
                );
            """)
            conn.commit()

    # ==========================================
    # C - CREATE (GERENCIAMENTO DE PASTAS/LISTAS)
    # ==========================================
    def criar_lista(self, nome_lista):
        """Cria um registro de nova lista no banco do usuário."""
        try:
            nome_lista_limpo = nome_lista.strip()
            if not nome_lista_limpo:
                return {"sucesso": False, "erro": "O nome da lista não pode ser vazio."}
                
            with self._conectar() as conn:
                existe = conn.execute("SELECT 1 FROM listas WHERE nome = ?", (nome_lista_limpo,)).fetchone()
                if existe:
                    return {"sucesso": False, "erro": "Já existe uma lista com esse nome."}

                conn.execute("INSERT INTO listas (nome) VALUES (?)", (nome_lista_limpo,))
                conn.commit()
            return {"sucesso": True, "mensagem": f"Lista '{nome_lista_limpo}' criada com sucesso."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # C - CREATE & U - UPDATE (MATERIAIS PLANOS)
    # ==========================================
    def adicionar_a_lista(self, nome_lista, dados_material, nome_anterior=None):
        """Extrai os valores numéricos das propriedades do catálogo e salva de forma plana na cópia e referência."""
        try:
            nome_lista_limpo = nome_lista.strip()
            
            # Desempacota se vier envelopado na chave 'material'
            if "material" in dados_material and isinstance(dados_material["material"], dict):
                dados_material = dados_material["material"]
            
            # ==========================================================================================================================================
            # verificação de segurança para garantir que o nome do material exista antes de tentar acessar outras propriedades
            print("\n📦 PAYLOAD BRUTO RECEBIDO NO BACK-END:")
            import pprint
            pprint.pprint(dados_material)
            print("═"*40 + "\n")
            # ===============================================================================================================================

            nome_material = dados_material.get("nome", "Material_Sem_Nome").strip()
                        
            # --- Extração segura e planificação dos dados estruturados vindos do catálogo ---
            id_material = dados_material.get("id") or f"mat-user-{int(datetime.now().timestamp())}"
            categoria = dados_material.get("categoria", "Geral")
            status = dados_material.get("status", "Lista Pessoal")

            # Metadados/Auditoria
            metadados = dados_material.get("metadados", {}) if isinstance(dados_material.get("metadados"), dict) else {}
            data_adicao = metadados.get("data_adicao") or dados_material.get("data_adicao") or datetime.now().strftime("%Y-%m-%d")
            fonte = metadados.get("fonte_referencia") or dados_material.get("fonte_referencia") or "Inventário Pessoal"

            # 💡 Helper interno robusto: Prioriza o dado plano (raiz) e aceita fallback aninhado antigo
            def extrair_valor(bloco, chave):
                # 1. Tenta buscar direto na raiz (Cenário Atual: Dado Plano)
                if chave in dados_material:
                    valor_raiz = dados_material[chave]
                    return valor_raiz.get("valor") if isinstance(valor_raiz, dict) else valor_raiz
                    
                # 2. Fallback: Se não achar na raiz, tenta buscar dentro do bloco antigo (Legado)
                dict_prop = dados_material.get(bloco, {})
                if isinstance(dict_prop, dict) and chave in dict_prop:
                    item = dict_prop[chave]
                    return item.get("valor") if isinstance(item, dict) else item
                    
                return None

            # Extração Mecânica
            densidade = extrair_valor("propriedades_mecanicas", "densidade")
            modulo_elasticidade = extrair_valor("propriedades_mecanicas", "modulo_elasticidade")
            coef_poisson = extrair_valor("propriedades_mecanicas", "coeficiente_poisson")
            lim_compressao = extrair_valor("propriedades_mecanicas", "limite_compressao")
            lim_tracao = extrair_valor("propriedades_mecanicas", "limite_tracao") or extrair_valor("propriedades_mecanicas", "limite_laminacao")
            lim_cisalhamento = extrair_valor("propriedades_mecanicas", "limite_cisalhamento")

            # Extração Térmica (Tratando chaves com e sem acentuação de forma segura na raiz ou no bloco)
            cond_termica = extrair_valor("propriedades_termicas", "condutividade_termica")
            calor_esp = extrair_valor("propriedades_termicas", "calor_especifico") or extrair_valor("propriedades_termicas", "calor_específico")
            exp_termica = extrair_valor("propriedades_termicas", "expansao_termica") or extrair_valor("propriedades_termicas", "expansão_térmica")
            pt_fusao = extrair_valor("propriedades_termicas", "ponto_fusao") or extrair_valor("propriedades_termicas", "ponto_fusão")

            # Extração Elétrica
            cond_eletrica = extrair_valor("propriedades_eletricas", "condutividade_eletrica") or extrair_valor("propriedades_eletricas", "condutividade_elétrica")
            resistividade = extrair_valor("propriedades_eletricas", "resistividade")

            # Extração e conversão das Tags para String plana (SQLite amigável)
            tags_lista = dados_material.get("tags", [])
            # Garante que é uma lista e junta tudo por vírgula: "alta potência, data center"
            tags_string = ",".join(tags_lista) if isinstance(tags_lista, list) else ""

            # 🔍 LOG DE VALIDAÇÃO DOS DADOS PLANOS NO BACK-END (COMPLETO):
            print("\n" + "═"*50)
            print("   📊 AUDITORIA DE VARIÁVEIS PRONTAS PARA O BANCO")
            print("═"*50)
            print(f"ID Material:          {id_material}")
            print(f"Nome:                 {nome_material}")
            print(f"Categoria:            {categoria}")
            print(f"Status:               {status}")
            print(f"Data Adição:          {data_adicao}")
            print(f"Fonte Referência:     {fonte}")
            print(f"Metadados Brutos:     {metadados}")
            print("─"*50)
            print("🔩 PROPRIEDADES MECÂNICAS:")
            print(f"  • Densidade:             {densidade}")
            print(f"  • Módulo Elasticidade:   {modulo_elasticidade}")
            print(f"  • Coeficiente Poisson:   {coef_poisson}")
            print(f"  • Limite Compressão:     {lim_compressao}")
            print(f"  • Limite Tração:         {lim_tracao}")
            print(f"  • Limite Cisalhamento:   {lim_cisalhamento}")
            print("─"*50)
            print("🔥 PROPRIEDADES TÉRMICAS:")
            print(f"  • Condutividade Térmica: {cond_termica}")
            print(f"  • Calor Específico:      {calor_esp}")
            print(f"  • Expansão Térmica:      {exp_termica}")
            print(f"  • Ponto de Fusão:        {pt_fusao}")
            print("─"*50)
            print("⚡ PROPRIEDADES ELÉTRICAS:")
            print(f"  • Condutividade Elétrica:{cond_eletrica}")
            print(f"  • Resistividade:         {resistividade}")
            print("═"*50 + "\n")

            with self._conectar() as conn:
                # Garante que a lista exista
                conn.execute("INSERT OR IGNORE INTO listas (nome) VALUES (?)", (nome_lista_limpo,))

                # 1️⃣ Persistência Plana Completa (Cópia Física Local)
                conn.execute("""
                    INSERT INTO materiais (
                        id, nome, categoria, status, data_adicao, fonte_referencia,
                        densidade, modulo_elasticidade, coeficiente_poisson, limite_compressao, limite_tracao, limite_cisalhamento,
                        condutividade_termica, calor_especifico, expansao_termica, ponto_fusao,
                        condutividade_eletrica, resistividade,
                        tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome,
                        categoria=excluded.categoria,
                        status=excluded.status,
                        data_adicao=excluded.data_adicao,
                        fonte_referencia=excluded.fonte_referencia,
                        densidade=excluded.densidade,
                        modulo_elasticidade=excluded.modulo_elasticidade,
                        coeficiente_poisson=excluded.coeficiente_poisson,
                        limite_compressao=excluded.limite_compressao,
                        limite_tracao=excluded.limite_tracao,
                        limite_cisalhamento=excluded.limite_cisalhamento,
                        condutividade_termica=excluded.condutividade_termica,
                        calor_especifico=excluded.calor_especifico,
                        expansao_termica=excluded.expansao_termica,
                        ponto_fusao=excluded.ponto_fusao,
                        condutividade_eletrica=excluded.condutividade_eletrica,
                        resistividade=excluded.resistividade,
                        tags=excluded.tags;
                """, (
                    id_material, nome_material, categoria, status, data_adicao, fonte,
                    densidade, modulo_elasticidade, coef_poisson, lim_compressao, lim_tracao, lim_cisalhamento,
                    cond_termica, calor_esp, exp_termica, pt_fusao,
                    cond_eletrica, resistividade,
                    tags_string
                ))

                # Gerenciamento de troca/renomeação de vínculo
                if nome_anterior:
                    conn.execute("""
                        DELETE FROM lista_materiais 
                        WHERE nome_lista = ? AND id_material = ?
                    """, (nome_lista_limpo, nome_anterior.strip()))

                # 2️⃣ Persistência na Tabela de Referência / Amarração N:N
                conn.execute("""
                    INSERT OR IGNORE INTO lista_materiais (nome_lista, id_material)
                    VALUES (?, ?)
                """, (nome_lista_limpo, id_material))
                
                conn.commit()

            return {"sucesso": True, "mensagem": f"'{nome_material}' clonado de forma plana em '{nome_lista_limpo}'."}
        except Exception as e:
            print(f"[SQLITE REPOSITÓRIO ERROR] Falha ao salvar material expandido: {e}")
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # R - READ (LISTAS E RETORNO PLANO REESTRUTURADO)
    # ==========================================
    def listar_listas_criadas(self):
        try:
            with self._conectar() as conn:
                linhas = conn.execute("SELECT nome FROM listas ORDER BY nome ASC").fetchall()
                return [linha["nome"] for linha in linhas]
        except Exception as e:
            print(f"[SQLITE REPOSITÓRIO ERROR] Erro ao listar listas: {e}")
            return []

    def _montar_objeto_material(self, linha, nome_lista):
        """Mapeia os dados planos da linha do banco para a saída da API."""
        
        # Deserializa a string de tags de volta para uma lista do Python
        tags_raw = Web_campo_safe(linha, "tags")
        tags_list = [t.strip() for t in tags_raw.split(',')] if tags_raw else []

        return {
            "id": linha["id"],
            "id_arquivo": linha["id"],
            "nome": linha["nome"],
            "categoria": linha["categoria"],
            "status": linha["status"],
            "lista_origem": nome_lista,
            "data_adicao": Web_campo_safe(linha, "data_adicao"),
            "fonte_referencia": Web_campo_safe(linha, "fonte_referencia"),
            
            # Mecânicas
            "densidade": linha["densidade"],
            "modulo_elasticidade": linha["modulo_elasticidade"],
            "coeficiente_poisson": linha["coeficiente_poisson"],
            "limite_compressao": linha["limite_compressao"],
            "limite_tracao": linha["limite_tracao"],
            "limite_cisalhamento": linha["limite_cisalhamento"],
            
            # Térmicas
            "condutividade_termica": linha["condutividade_termica"],
            "calor_especifico": linha["calor_especifico"],
            "expansao_termica": linha["expansao_termica"],
            "ponto_fusao": linha["ponto_fusao"],
            
            # Elétricas
            "condutividade_eletrica": linha["condutividade_eletrica"],
            "resistividade": linha["resistividade"],
            
            # Tags (Enviadas como lista para o Front-end)
            "tags": tags_list
        }

    def listar_materiais_da_lista(self, nome_lista):
        materiais = []
        try:
            with self._conectar() as conn:
                linhas = conn.execute("""
                    SELECT m.* FROM materiais m
                    JOIN lista_materiais lm ON m.id = lm.id_material
                    WHERE lm.nome_lista = ?
                """, (nome_lista.strip(),)).fetchall()
                
                for linha in linhas:
                    materiais.append(self._montar_objeto_material(linha, nome_lista.strip()))
            return materiais
        except Exception as e:
            print(f"[SQLITE REPOSITÓRIO ERROR] Erro ao listar materiais: {e}")
            return []

    def listar_todos_materiais_usuario(self):
        todos_materiais = []
        try:
            with self._conectar() as conn:
                linhas = conn.execute("""
                    SELECT m.*, lm.nome_lista FROM materiais m
                    JOIN lista_materiais lm ON m.id = lm.id_material
                """).fetchall()
                
                for linha in linhas:
                    todos_materiais.append(self._montar_objeto_material(linha, linha["nome_lista"]))
            return todos_materiais
        except Exception as e:
            print(f"[SQLITE REPOSITÓRIO ERROR] Erro ao buscar inventário total: {e}")
            return []

    # ==========================================
    # U - UPDATE (GERENCIAMENTO DE PASTAS)
    # ==========================================
    def renomear_lista(self, nome_antigo, nome_novo):
        try:
            nome_antigo_limpo = nome_antigo.strip()
            nome_novo_limpo = nome_novo.strip()

            with self._conectar() as conn:
                existe_destino = conn.execute("SELECT 1 FROM listas WHERE nome = ?", (nome_novo_limpo,)).fetchone()
                if existe_destino:
                    return {"sucesso": False, "erro": "Já existe uma lista com o novo nome escolhido."}

                conn.execute("UPDATE listas SET nome = ? WHERE nome = ?", (nome_novo_limpo, nome_antigo_limpo))
                conn.commit()
            return {"sucesso": True, "mensagem": f"Lista alterada para '{nome_novo_limpo}'."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    # ==========================================
    # D - DELETE (PASTAS E COLETOR DE LIXO)
    # ==========================================
    def excluir_material(self, nome_lista, nome_material_ou_id):
        try:
            alvo = nome_material_ou_id.strip()
            with self._conectar() as conn:
                id_real = conn.execute("SELECT id FROM materiais WHERE id = ? OR nome = ?", (alvo, alvo)).fetchone()
                
                if not id_real:
                    return {"sucesso": False, "erro": "Material não encontrado."}
                
                id_mat = id_real["id"]
                conn.execute("DELETE FROM lista_materiais WHERE nome_lista = ? AND id_material = ?", (nome_lista.strip(), id_mat))

                # Coletor de lixo: se o material ficou órfão (sem nenhuma lista), deleta fisicamente
                restantes = conn.execute("SELECT COUNT(*) as qtd FROM lista_materiais WHERE id_material = ?", (id_mat,)).fetchone()
                if restantes["qtd"] == 0:
                    conn.execute("DELETE FROM materiais WHERE id = ?", (id_mat,))

                conn.commit()
            return {"sucesso": True, "mensagem": "Material removido com sucesso."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    def excluir_lista(self, nome_lista):
        try:
            with self._conectar() as conn:
                conn.execute("DELETE FROM listas WHERE nome = ?", (nome_lista.strip(),))
                conn.execute("DELETE FROM materiais WHERE id NOT IN (SELECT DISTINCT id_material FROM lista_materiais)")
                conn.commit()
            return {"sucesso": True, "mensagem": f"Lista '{nome_lista}' removida com sucesso."}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

    def preparar_para_central(self, nome_lista, nome_material):
        try:
            with self._conectar() as conn:
                linha = conn.execute("""
                    SELECT m.* FROM materiais m
                    JOIN lista_materiais lm ON m.id = lm.id_material
                    WHERE lm.nome_lista = ? AND m.nome = ?
                """, (nome_lista.strip(), nome_material.strip())).fetchone()

                if not linha:
                    return {"sucesso": False, "erro": "Material local não encontrado."}

                dados_originais = self._montar_objeto_material(linha, nome_lista.strip())
            return {"sucesso": True, "payload": dados_originais}
        except Exception as e:
            return {"sucesso": False, "erro": str(e)}

# Helper sintático para manipulação segura de strings vindas do banco
def Web_campo_safe(linha, chave):
    try:
        return linha[chave]
    except:
        return None