import math

class Momento:
    @staticmethod
    def calcular_momento(momento=None, forca=None, distancia=None, angulo=None):
        # 1. Validação dos parâmetros do Solver (Agora monitorando 4 itens)
        params = [momento, forca, distancia, angulo]
        preenchidos = [p for p in params if p is not None]

        if len(preenchidos) < 3:
            return {"erro": "Forneça pelo menos três valores."}

        if len(preenchidos) > 3:
            return {"erro": "Deixe exatamente um campo em branco."}

        # 2. Se o ângulo NÃO for a incógnita, já calcula o seno dele para usar nas outras fórmulas
        if angulo is not None:
            angulo_radianos = math.radians(angulo)
            seno_angulo = math.sin(angulo_radianos)
            
            # Proteção contra divisões por zero se o seno for nulo
            if seno_angulo == 0 and (forca is None or distancia is None):
                return {"erro": "Com ângulo de 0° ou 180° não há torque gerado, impossível calcular Força ou Distância."}

        # 3. Lógica do Solver expandida para 4 cenários
        if momento is None:
            # M = F * d * sin(θ)
            resultado = forca * distancia * seno_angulo
            return {"momento": round(resultado, 4)}

        if forca is None:
            # F = M / (d * sin(θ))
            resultado = momento / (distancia * seno_angulo)
            return {"forca": round(resultado, 4)}

        if distancia is None:
            # d = M / (F * sin(θ))
            resultado = momento / (forca * seno_angulo)
            return {"distancia": round(resultado, 4)}

        if angulo is None:
            # Proteção contra divisão por zero se Força ou Distância forem 0
            if forca == 0 or distancia == 0:
                return {"erro": "Força ou distância não podem ser zero para calcular o ângulo."}
                
            # sin(θ) = M / (F * d)
            seno_calculado = momento / (forca * distancia)
            
            # Validação física do limite do Seno [-1, 1]
            if seno_calculado > 1.0 or seno_calculado < -1.0:
                return {"erro": "Os valores fornecidos geram um Seno impossível (fora do intervalo [-1, 1]). Verifique os dados."}
            
            # θ = arcsin(seno_calculado) -> Retorna em radianos
            radianos_resultado = math.asin(seno_calculado)
            # Converte de volta para Graus para exibir na tela do usuário
            graus_resultado = math.degrees(radianos_resultado)
            
            return {"angulo": round(graus_resultado, 2)} # 2 casas decimais para graus fica excelente