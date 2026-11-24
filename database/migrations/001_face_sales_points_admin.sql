
-- Migration 001: estruturas complementares do Parabon Bank.
-- Banco: sistema_bancario
-- Nao altera nem remove tabelas existentes.

CREATE TABLE IF NOT EXISTS face_payment_sessao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  conta_id BIGINT UNSIGNED NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  referencia VARCHAR(100) NOT NULL,
  desafio_hash CHAR(64) NOT NULL,
  status ENUM(
    'PENDENTE',
    'VERIFICADA',
    'RECUSADA',
    'EXPIRADA',
    'CANCELADA'
  ) NOT NULL DEFAULT 'PENDENTE',
  provedor VARCHAR(50) DEFAULT NULL,
  referencia_verificacao VARCHAR(150) DEFAULT NULL,
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em DATETIME NOT NULL,
  verificada_em DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_face_referencia (referencia),
  KEY idx_face_cliente_data (cliente_id, criada_em),
  KEY idx_face_status_expira (status, expira_em),
  CONSTRAINT fk_face_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_face_conta
    FOREIGN KEY (conta_id) REFERENCES conta(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_face_valor CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS venda (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conta_id BIGINT UNSIGNED NOT NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  identificador VARCHAR(100) NOT NULL,
  estabelecimento VARCHAR(150) NOT NULL,
  descricao VARCHAR(255) DEFAULT NULL,
  valor DECIMAL(15,2) NOT NULL,
  quantidade_parcelas INT UNSIGNED NOT NULL DEFAULT 1,
  forma_pagamento ENUM('PIX', 'FACE_PAYMENT', 'SALDO') NOT NULL,
  status ENUM(
    'PENDENTE',
    'APROVADA',
    'RECUSADA',
    'CANCELADA',
    'ESTORNADA'
  ) NOT NULL DEFAULT 'PENDENTE',
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_venda_identificador (identificador),
  KEY idx_venda_cliente_data (cliente_id, criada_em),
  KEY idx_venda_conta_data (conta_id, criada_em),
  CONSTRAINT fk_venda_conta
    FOREIGN KEY (conta_id) REFERENCES conta(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_venda_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_venda_valor CHECK (valor > 0),
  CONSTRAINT chk_venda_parcelas CHECK (quantidade_parcelas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS pontos_movimentacao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  beneficio_id BIGINT UNSIGNED DEFAULT NULL,
  tipo ENUM('CREDITO', 'RESGATE', 'AJUSTE') NOT NULL,
  pontos BIGINT UNSIGNED NOT NULL,
  descricao VARCHAR(255) DEFAULT NULL,
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pontos_cliente_data (cliente_id, criada_em),
  KEY idx_pontos_beneficio (beneficio_id),
  CONSTRAINT fk_pontos_mov_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pontos_mov_beneficio
    FOREIGN KEY (beneficio_id) REFERENCES beneficio(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_pontos_mov_valor CHECK (pontos > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS administrador (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('ADMIN', 'OPERADOR') NOT NULL DEFAULT 'OPERADOR',
  status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ATIVO',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administrador_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
