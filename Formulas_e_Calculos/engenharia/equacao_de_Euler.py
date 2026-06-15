import math

class equacao_de_Euler:
    
    @staticmethod
    def calcular_equacao_de_Euler(carga_atuante=None, modulo_elasticidade=None, momento_inercia=None, comprimento=None, tipo_fixacao=None, coeficiente_seguranca=2.5):
        """
        Aplica a Equação de Euler para analisar a estabilidade elástica de colunas (Flambagem).
        Permite verificar a segurança de um pilar existente ou dimensionar limites geométricos/mecânicos.
        """

        # 0. Validação e tratamento de entradas para garantir robustez e evitar erros de execução
        if coeficiente_seguranca is None:
            coeficiente_seguranca = 2.5

        # 1. Definição do coeficiente de segurança padrão de norma para flambagem (geralmente FS = 2.5)
        if coeficiente_seguranca <= 0:
            coeficiente_seguranca = 2.5

        # 2. Mapeamento normativo do Fator de Fixação (K)
        fatores_k = {
            "biarticulada": 1.0,          # Apoio-Apoio
            "biengastada": 0.65,          # Engaste-Engaste
            "engastada_livre": 2.1,       # Engaste-Livre
            "engastada_articulada": 0.8    # Engaste-Apoio
        }

        if not tipo_fixacao or tipo_fixacao not in fatores_k:
            return {"erro": "Tipo de fixação inválido ou não selecionado."}
            
        k = fatores_k[tipo_fixacao]

        # Agrupamento de variáveis para o padrão Solver do EngenhApp
        params_principais = [carga_atuante, modulo_elasticidade, momento_inercia, comprimento]
        preenchidos = [p for p in params_principais if p is not None]

        # =========================================================================
        # CENÁRIO 1: VERIFICAÇÃO COMPLETA (Todos os 4 campos preenchidos)
        # =========================================================================
        if len(preenchidos) == 4:
            if carga_atuante <= 0 or modulo_elasticidade <= 0 or momento_inercia <= 0 or comprimento <= 0:
                return {"erro": "Para verificação, todos os valores numéricos devem ser maiores que zero."}

            comprimento_efetivo = k * comprimento
            carga_critica = (math.pi**2 * modulo_elasticidade * momento_inercia) / (comprimento_efetivo**2)
            carga_admissivel = carga_critica / coeficiente_seguranca

            aprovado = carga_atuante <= carga_admissivel
            status = "APROVADO (Coluna Estável)" if aprovado else "FALHA POR FLAMBAGEM (Colapso Estrutural Iminente)"

            # Cálculo de limites para a Nota Técnica complementar
            i_min = (carga_atuante * coeficiente_seguranca * (comprimento_efetivo**2)) / (math.pi**2 * modulo_elasticidade)
            l_max = (1 / k) * math.sqrt((math.pi**2 * modulo_elasticidade * momento_inercia) / (carga_atuante * coeficiente_seguranca))

            return {
                "carga_critica_teorica": round(carga_critica, 2),
                "carga_admissivel_segura": round(carga_admissivel, 2),
                "status": status,
                "aprovado": aprovado,
                "nota_tecnica": f"Esta coluna suporta uma carga útil máxima de {round(carga_admissivel, 2)} N. O momento de inércia MÍNIMO exigido é {round(i_min, 8)} m⁴. O comprimento MÁXIMO seguro para esta seção é de {round(l_max, 2)} m."
            }

        # =========================================================================
        # CENÁRIO 2: DIMENSIONAMENTO AUTOMÁTICO (Falta exatamente 1 campo)
        # =========================================================================
        if len(preenchidos) == 3:
            
            # Caso A: Descobrir a carga útil máxima suportada (Limite Superior)
            if carga_atuante is None:
                if modulo_elasticidade <= 0 or momento_inercia <= 0 or comprimento <= 0:
                    return {"erro": "Propriedades e comprimento devem ser maiores que zero."}
                
                carga_critica = (math.pi**2 * modulo_elasticidade * momento_inercia) / ((k * comprimento)**2)
                carga_adm_max = carga_critica / coeficiente_seguranca
                
                return {
                    "carga_atuante": round(carga_adm_max, 2),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Considerando o fator K={k} e FS={coeficiente_seguranca}, a carga atuante máxima sobre a coluna deve ser de {round(carga_adm_max, 2)} N."
                }

            # Caso B: Descobrir a geometria interna mínima - Inércia (Limite Inferior)
            if momento_inercia is None:
                if carga_atuante <= 0 or modulo_elasticidade <= 0 or comprimento <= 0:
                    return {"erro": "Carga, elasticidade e comprimento devem ser maiores que zero."}
                
                i_min = (carga_atuante * coeficiente_seguranca * ((k * comprimento)**2)) / (math.pi**2 * modulo_elasticidade)
                return {
                    "momento_inercia": round(i_min, 8),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Para evitar o colapso por flambagem, a seção transversal do pilar deve possuir um Momento de Inércia (I) de no MÍNIMO {round(i_min, 8)} m⁴."
                }

            # Caso C: Descobrir o comprimento máximo aceitável da coluna (Limite Superior)
            if comprimento is None:
                if carga_atuante <= 0 or modulo_elasticidade <= 0 or momento_inercia <= 0:
                    return {"erro": "Carga, elasticidade e inércia devem ser maiores que zero."}
                
                l_max = (1 / k) * math.sqrt((math.pi**2 * modulo_elasticidade * momento_inercia) / (carga_atuante * coeficiente_seguranca))
                return {
                    "comprimento": round(l_max, 2),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Para a carga de projeto informada, a coluna pode ter um comprimento de no MÁXIMO {round(l_max, 2)} metros sem flambar."
                }

            # Caso D: Descobrir a rigidez mínima do material - Módulo de Elasticidade (Limite Inferior)
            if modulo_elasticidade is None:
                if carga_atuante <= 0 or momento_inercia <= 0 or comprimento <= 0:
                    return {"erro": "Carga, inércia e comprimento devem ser maiores que zero."}
                
                e_min = (carga_atuante * coeficiente_seguranca * ((k * comprimento)**2)) / (math.pi**2 * momento_inercia)
                return {
                    "modulo_elasticidade": round(e_min, 2),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"O material escolhido para esta coluna deve apresentar um Módulo de Elasticidade (E) de no MÍNIMO {round(e_min, 2)} Pa."
                }

        return {"erro": "Preencha os 4 valores principais para verificar a estabilidade ou deixe EXATAMENTE 1 em branco para dimensioná-lo."}