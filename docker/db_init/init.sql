CREATE UNLOGGED TABLE payments (
    id UUID PRIMARY KEY,
    correlation_id UUID NOT NULL,
    amount DECIMAL NOT NULL,
    payment_processor VARCHAR(50,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP default now() NOT NULL
);

CREATE INDEX payments_created_at ON payments (created_at );
CREATE INDEX payments_correlation_id ON payments (correlation_id);