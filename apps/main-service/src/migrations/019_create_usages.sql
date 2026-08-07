CREATE TABLE usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created TIMESTAMPTZ NOT NULL DEFAULT now(),
    modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    state INTEGER NOT NULL DEFAULT 0,
    datetime TIMESTAMPTZ NOT NULL,
    type bill_type NOT NULL,
    usage FLOAT NOT NULL
);
