CREATE UNLOGGED TABLE payments (
    correlation_id UUID PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    payment_processor VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX payments_created_at ON payments (created_at );
CREATE INDEX payments_correlation_id ON payments (correlation_id);