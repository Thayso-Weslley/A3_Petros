class Potencia:
    @staticmethod
    def calcular_potencia(potencia=None, trabalho=None, tempo=None):

        params = [potencia, trabalho, tempo]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if potencia is None:
            return {"potencia": trabalho / tempo}

        if trabalho is None:
            return {"trabalho": potencia * tempo}

        if tempo is None:
            return {"tempo": trabalho / potencia}