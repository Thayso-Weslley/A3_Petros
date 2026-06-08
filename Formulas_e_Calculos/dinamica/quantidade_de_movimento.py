class QuantDeMovimento:
    @staticmethod
    def calcular_quantidade_movimento(q=None, massa=None, velocidade=None):

        params = [q, massa, velocidade]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if q is None:
            return {"quantidade_movimento": massa * velocidade}

        if massa is None:
            return {"massa": q / velocidade}

        if velocidade is None:
            return {"velocidade": q / massa}