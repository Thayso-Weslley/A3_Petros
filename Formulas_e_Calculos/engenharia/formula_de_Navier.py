class formula_de_Navier:
    
    @staticmethod
    def calcular_formula_de_Navier(momento=None, modulo_resistencia=None, tensao_escoamento=None, coeficiente_seguranca=1.67):
        """
        Aplica a fórmula de Navier (σ = M / Wx) combinando Verificação Estrutural 
        e Dimensionamento de limites (mínimos/máximos) para Engenharia.
        """

        # 1. Trata o None primeiro. Se for None, assume o valor padrão da norma (1.67)
        if coeficiente_seguranca is None:
            coeficiente_seguranca = 1.67

        # 2. Agora sim, com a garantia de que é um número, faz a checagem de limite
        if coeficiente_seguranca <= 0:
            return {"erro": "O coeficiente de segurança deve ser maior que zero."}
            

        params = [momento, modulo_resistencia, tensao_escoamento]
        preenchidos = [p for p in params if p is not None]

        # =========================================================================
        # CENÁRIO 1: VERIFICAÇÃO COMPLETA (Todos os 3 campos preenchidos)
        # =========================================================================
        if len(preenchidos) == 3:
            if momento <= 0 or modulo_resistencia <= 0 or tensao_escoamento <= 0:
                return {"erro": "Para verificação, todos os valores devem ser maiores que zero."}
            
            tensao_admissivel = tensao_escoamento / coeficiente_seguranca
            tensao_maxima = momento / modulo_resistencia
            aprovado = tensao_maxima <= tensao_admissivel
            
            # Mesmo estando aprovado ou reprovado, calculamos os limites de tolerância para ajudar o engenheiro
            m_max = (tensao_escoamento * modulo_resistencia) / coeficiente_seguranca
            wx_min = (momento * coeficiente_seguranca) / tensao_escoamento
            
            status = "APROVADO (Estrutura Segura)" if aprovado else "FALHA POR FLEXÃO (Estrutura Condenada)"
            
            return {
                "tensao_maxima": round(tensao_maxima, 2),
                "tensao_admissivel": round(tensao_admissivel, 2),
                "status": status,
                "aprovado": aprovado,
                "nota_tecnica": f"Esta viga suporta no MÁXIMO {round(m_max, 2)} N·m de momento. O módulo de resistência MÍNIMO exigido era de {round(wx_min, 4)} m³."
            }

        # =========================================================================
        # CENÁRIO 2: DIMENSIONAMENTO AUTOMÁTICO (Falta exatamente 1 campo)
        # =========================================================================
        if len(preenchidos) == 2:
            
            # Caso A: Descobrir o carregamento máximo permitido (Limite Superior)
            if momento is None:
                if modulo_resistencia <= 0 or tensao_escoamento <= 0:
                    return {"erro": "As propriedades materiais e geométricas devem ser maiores que zero."}
                # M_max = (σ_y * Wx) / FS
                m_max = (tensao_escoamento * modulo_resistencia) / coeficiente_seguranca
                return {
                    "momento": round(m_max, 2),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Para garantir a segurança, o momento fletor aplicado deve ser de no MÁXIMO {round(m_max, 2)} N·m."
                }
                
            # Caso B: Descobrir a geometria mínima necessária (Limite Inferior)
            if modulo_resistencia is None:
                if momento <= 0 or tensao_escoamento <= 0:
                    return {"erro": "O momento e a tensão de escoamento devem ser maiores que zero."}
                # Wx_min = (M * FS) / σ_y
                wx_min = (momento * coeficiente_seguranca) / tensao_escoamento
                return {
                    "modulo_resistencia": round(wx_min, 4),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Para resistir ao esforço, a viga deve possuir um módulo de resistência de no MÍNIMO {round(wx_min, 4)} m³."
                }
                
            # Caso C: Descobrir a resistência mínima do material (Limite Inferior)
            if tensao_escoamento is None:
                if momento <= 0 or modulo_resistencia <= 0:
                    return {"erro": "O momento e o módulo de resistência devem ser maiores que zero."}
                # σ_y_min = (M * FS) / Wx
                tensao_y_min = (momento * coeficiente_seguranca) / modulo_resistencia
                return {
                    "tensao_escoamento": round(tensao_y_min, 2),
                    "status": "DIMENSIONADO COM SUCESSO",
                    "nota_tecnica": f"Para esta geometria, o material da viga deve possuir uma tensão de escoamento de no MÍNIMO {round(tensao_y_min, 2)} Pa."
                }

        # Se cair aqui, não atende a nenhuma regra do Solver
        return {"erro": "Preencha os 3 campos para verificar a estrutura ou deixe EXATAMENTE 1 em branco para dimensioná-lo."}