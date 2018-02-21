DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(200) NOT NULL,
    signature TEXT NOT NULL //text datatype has no set limit.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
