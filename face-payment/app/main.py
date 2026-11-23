"""Servico especializado de verificacao para o prototipo Parabon Bank.

Este modulo NAO autoriza pagamentos e ainda NAO executa reconhecimento facial.
A API Node.js permanece responsavel por autenticacao, regras financeiras e transacoes.
Nenhuma imagem facial e persistida por este servico.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="Parabon Bank - Face Payment",
    version="0.1.0",
    description="Servico auxiliar de verificacao facial; nao movimenta dinheiro.",
)


class VerificationRequest(BaseModel):
    session_reference: str = Field(min_length=16, max_length=100)
    challenge: str = Field(min_length=16, max_length=256)


@app.get("/health")
def health():
    return {"status": "ok", "verification_configured": False}


@app.post("/verify")
def verify(payload: VerificationRequest):
    # Falha fechada: sem um provedor/modelo real configurado, nunca aprova.
    raise HTTPException(
        status_code=503,
        detail={
            "code": "FACE_VERIFICATION_NOT_CONFIGURED",
            "message": "A verificacao facial ainda nao foi configurada.",
        },
    )
