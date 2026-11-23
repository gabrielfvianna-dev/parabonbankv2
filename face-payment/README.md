# Face Payment - modulo Python

Servico auxiliar separado da API principal Node.js.

## Responsabilidades
- Futuramente receber uma referencia de sessao e executar a verificacao.
- Retornar somente o resultado tecnico da verificacao.
- Nao autenticar usuarios, consultar saldo, aprovar valores ou executar pagamentos.

## Estado atual
- `GET /health`: confirma que o servico esta ativo.
- `POST /verify`: retorna HTTP 503 enquanto um provedor de verificacao real nao estiver configurado. Isso e intencional (fail closed).

## Executar localmente
```powershell
cd face-payment
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Nao enviar nem armazenar fotos faciais neste scaffold. A integracao futura deve exigir consentimento, protecao dos dados biometricos e verificacao apropriada de apresentacao (liveness), sem registrar imagens ou templates em logs.
