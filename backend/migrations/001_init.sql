CREATE EXTENSION IF NOT EXISTS vector;

-- Create the nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    terms TEXT[] NOT NULL,
    audio_url VARCHAR(255),
    embedding vector(384) -- all-MiniLM-L6-v2 outputs 384 dimensions
);

-- Create the edges table for graph traversal
CREATE TABLE IF NOT EXISTS edges (
    source VARCHAR(50) REFERENCES nodes(id),
    target VARCHAR(50) REFERENCES nodes(id),
    type VARCHAR(50) NOT NULL,
    PRIMARY KEY (source, target, type)
);

-- Seed Data (Nodes)
INSERT INTO nodes (id, label, type, summary, terms, embedding) VALUES
('healthcare', 'Healthcare Platforms', 'concept', 'Building systems for health data management and telemedicine.', ARRAY['hospital', 'clinic', 'doctor', 'health', 'patient', 'medical'], NULL),
('fintech', 'Fintech & Payments', 'concept', 'Financial technology systems, payment gateways, and core banking integrations.', ARRAY['finance', 'money', 'bank', 'pay', 'transaction', 'fintech'], NULL),
('ecommerce', 'E-Commerce & Supply Chain', 'concept', 'Digital marketplaces and logistics management for cross-border trade.', ARRAY['shop', 'store', 'importing', 'china', 'order', 'delivery', 'logistics'], NULL),
('hipaa', 'HIPAA Compliance', 'advisory', 'International standard for protecting sensitive patient health information.', ARRAY['hipaa', 'privacy', 'health data'], NULL),
('data_act', 'Malawi Data Protection Act', 'law', 'Malawi''s legislative framework for data privacy and protection of personal information.', ARRAY['data protection', 'law', 'privacy', 'malawi'], NULL),
('mw_json', 'MW-JSON Standard', 'fact', 'A unified protocol for fintech interoperability within Malawi, facilitating seamless cross-platform transactions.', ARRAY['standard', 'interoperability', 'mw-json', 'protocol'], NULL),
('reserve_bank', 'RBM Guidelines', 'advisory', 'Directives and regulations issued by the Reserve Bank of Malawi for digital financial services.', ARRAY['rbm', 'reserve bank', 'regulation', 'compliance'], NULL),
('supply_chain', 'Import & Customs Laws', 'law', 'Regulations governing the importation of goods into Malawi, including MRA tariff structures.', ARRAY['import', 'customs', 'mra', 'tax', 'tariffs'], NULL),
('education', 'EdTech Platforms', 'concept', 'Digital learning environments and educational management systems.', ARRAY['education', 'school', 'learning', 'student', 'teacher', 'skillrise'], NULL),
('accessibility', 'Digital Accessibility Standards', 'advisory', 'Guidelines ensuring digital platforms are usable by people with various disabilities.', ARRAY['a11y', 'accessibility', 'inclusion', 'wcag'], NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Data (Edges)
INSERT INTO edges (source, target, type) VALUES
('healthcare', 'hipaa', 'REQUIRES_COMPLIANCE'),
('healthcare', 'data_act', 'REQUIRES_COMPLIANCE'),
('fintech', 'mw_json', 'IMPLEMENTS_STANDARD'),
('fintech', 'data_act', 'REQUIRES_COMPLIANCE'),
('fintech', 'reserve_bank', 'REGULATED_BY'),
('ecommerce', 'supply_chain', 'REGULATED_BY'),
('ecommerce', 'data_act', 'REQUIRES_COMPLIANCE'),
('ecommerce', 'fintech', 'DEPENDS_ON'),
('education', 'data_act', 'REQUIRES_COMPLIANCE'),
('education', 'accessibility', 'SHOULD_IMPLEMENT'),
('healthcare', 'accessibility', 'SHOULD_IMPLEMENT')
ON CONFLICT DO NOTHING;

-- Create an HNSW index for fast approximate nearest neighbor search
CREATE INDEX ON nodes USING hnsw (embedding vector_cosine_ops);
