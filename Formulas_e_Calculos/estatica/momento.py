class Momento:
    @staticmethod
    def calcular_momento(momento=None, forca=None, distancia=None):

        params = [momento, forca, distancia]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        if len(preenchidos) > 2:
            return {"erro": "Deixe um campo em branco."}

        if momento is None:
            return {"momento": forca * distancia}

        if forca is None:
            return {"forca": momento / distancia}

        if distancia is None:
            return {"distancia": momento / forca}