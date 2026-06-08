class Atrito:
    @staticmethod
    def calcular_atrito(atrito=None, coeficiente=None, normal=None):

        params = [atrito, coeficiente, normal]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if atrito is None:
            return {"atrito": coeficiente * normal}

        if coeficiente is None:
            return {"coeficiente": atrito / normal}

        if normal is None:
            return {"normal": atrito / coeficiente}