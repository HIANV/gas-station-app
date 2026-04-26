-- Script SQL puro para criar a tabela, como alternativa ao modo ORM
CREATE TABLE IF NOT EXISTS abastecimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_abastecimento DATE NOT NULL,
    odometro REAL NOT NULL,
    litros REAL NOT NULL,
    preco_litro REAL NOT NULL,
    valor_total REAL NOT NULL,
    tipo_combustivel VARCHAR(50) NOT NULL,
    posto_nome VARCHAR(100)
);

-- Índices recomendados para facilitar ordenação/filtro por data ou tipo
CREATE INDEX idx_abastecimentos_data ON abastecimentos(data_abastecimento);
CREATE INDEX idx_abastecimentos_tipo ON abastecimentos(tipo_combustivel);
