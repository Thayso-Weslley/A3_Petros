# Formulas_e_calculos/dinamica/cinetica.py

class SegundaLeiNewton:
    @staticmethod
    def calcular(forca=None, massa=None, aceleracao=None):
        # Conta quantos campos foram preenchidos
        params = [forca, massa, aceleracao]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 2:
            return {"erro": "Forneça pelo menos dois valores."}

        # Lógica adaptativa: Identifica a incógnita
        if forca is None:
            res = massa * aceleracao
            return {"forca": res}
        
        if massa is None:
            res = forca / aceleracao
            return {"massa": res}
            
        if aceleracao is None:
            res = forca / massa
            return {"aceleracao": res}