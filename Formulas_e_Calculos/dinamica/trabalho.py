class Trabalho:
    @staticmethod
    def calcular_trabalho(trabalho=None, forca=None, distancia=None):

        params = [trabalho, forca, distancia]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if trabalho is None:
            return {"trabalho": forca * distancia}

        if forca is None:
            return {"forca": trabalho / distancia}

        if distancia is None:
            return {"distancia": trabalho / forca}