class Energia_Cinetica:
    @staticmethod
    def calcular_energia_cinetica(energia=None, massa=None, velocidade=None):

        params = [energia, massa, velocidade]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if energia is None:
            return {"energia": (massa * velocidade**2) / 2}

        if massa is None:
            return {"massa": (2 * energia) / (velocidade**2)}

        if velocidade is None:
            return {
                "velocidade": ((2 * energia) / massa) ** 0.5
            }