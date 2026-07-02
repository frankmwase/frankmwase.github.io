-- Seed More Data (Nodes)
INSERT INTO nodes (id, label, type, summary, terms, embedding) VALUES
('agritech', 'Agriculture Tech', 'concept', 'Digital solutions for smart farming, crop tracking, and supply chain management.', ARRAY['agriculture', 'farming', 'crops', 'agritech', 'fertilizer', 'farmers'], NULL),
('drone_corridor', 'Kasungu Drone Corridor', 'fact', 'Africa''s first humanitarian drone testing corridor established in Malawi.', ARRAY['drones', 'kasungu', 'humanitarian', 'delivery', 'corridor'], NULL),
('eta', 'Electronic Transactions Act', 'law', 'Malawi law regulating e-commerce, digital signatures, and cybercrime.', ARRAY['cybersecurity', 'electronic', 'transactions', 'e-commerce', 'digital signature', 'cybercrime'], NULL),
('openmrs', 'OpenMRS Malawi', 'fact', 'Open-source medical record system adapted for Malawian health facilities.', ARRAY['openmrs', 'medical records', 'emr', 'health system', 'baobab'], NULL),
('telemed', 'Telemedicine Systems', 'concept', 'Remote healthcare platforms facilitating virtual consultations.', ARRAY['telemedicine', 'virtual', 'remote', 'consultation', 'telehealth'], NULL),
('mobi_money', 'Mobile Money APIs', 'concept', 'Integrations with local mobile money providers like Airtel Money and TNM Mpamba.', ARRAY['mobile money', 'airtel money', 'tnm mpamba', 'wallet', 'api'], NULL),
('mra_asonycuda', 'MRA ASYCUDA World', 'fact', 'The automated system for customs data used by the Malawi Revenue Authority.', ARRAY['mra', 'asycuda', 'customs', 'tax', 'revenue'], NULL),
('consumer_protection', 'Consumer Protection Act', 'law', 'Legislation designed to protect consumers against unfair trade practices in Malawi.', ARRAY['consumer', 'protection', 'rights', 'trade', 'fairness'], NULL),
('climate_tech', 'Climate Tech', 'concept', 'Technology mitigating climate change impact, such as flood early warning systems.', ARRAY['climate', 'weather', 'floods', 'warning', 'environment'], NULL),
('ndpc', 'National Data Protection Commission', 'fact', 'The regulatory body overseeing the enforcement of the Data Protection Act.', ARRAY['ndpc', 'commission', 'regulator', 'data'], NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed More Data (Edges)
INSERT INTO edges (source, target, type) VALUES
('agritech', 'drone_corridor', 'UTILIZES'),
('agritech', 'mobi_money', 'DEPENDS_ON'),
('mobi_money', 'eta', 'REGULATED_BY'),
('mobi_money', 'reserve_bank', 'REGULATED_BY'),
('telemed', 'hipaa', 'REQUIRES_COMPLIANCE'),
('telemed', 'openmrs', 'INTEGRATES_WITH'),
('telemed', 'data_act', 'REQUIRES_COMPLIANCE'),
('ecommerce', 'consumer_protection', 'REGULATED_BY'),
('ecommerce', 'eta', 'REGULATED_BY'),
('ecommerce', 'mra_asonycuda', 'INTEGRATES_WITH'),
('fintech', 'mobi_money', 'INCLUDES'),
('fintech', 'eta', 'REGULATED_BY'),
('climate_tech', 'drone_corridor', 'UTILIZES'),
('data_act', 'ndpc', 'ENFORCED_BY')
ON CONFLICT DO NOTHING;
