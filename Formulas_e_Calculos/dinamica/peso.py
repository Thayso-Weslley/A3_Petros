class Peso:
    @staticmethod
    def calcular_peso(peso=None, massa=None, gravidade=None):

        params = [peso, massa, gravidade]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if peso is None:
            return {"peso": massa * gravidade}

        if massa is None:
            return {"massa": peso / gravidade}

        if gravidade is None:
            return {"gravidade": peso / massa}