-- HudumaTech Complete Database Setup
-- This script creates all tables with the dynamic system in one clean unified script
-- Run this in your Supabase SQL editor

BEGIN;

-- Enable necessary extensions
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================
-- CORE TABLES
-- =======================

-- Users table (links to auth.users)
CREATE TABLE users
(
    id                        UUID    NOT NULL,
    name                      VARCHAR NOT NULL,
    email                     VARCHAR NOT NULL UNIQUE,
    phone                     VARCHAR NOT NULL,
    location                  VARCHAR NOT NULL,
    avatar                    TEXT,
    created_at                TIMESTAMP DEFAULT NOW(),
    updated_at                TIMESTAMP DEFAULT NOW(),
    communication_preferences JSONB     DEFAULT '{
      "call_availability": true,
      "sms_notifications": true,
      "email_notifications": true,
      "preferred_contact_time": "anytime"
    }'::jsonb,
    is_admin                  BOOLEAN   DEFAULT false,
    is_blocked                BOOLEAN   DEFAULT false,
    blocked_reason            TEXT,
    blocked_at                TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
);

-- =======================
-- DYNAMIC SYSTEM TABLES
-- =======================

-- Service categories table (replaces hardcoded SERVICE_CATEGORIES)
CREATE TABLE service_categories
(
    id          UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    value       VARCHAR UNIQUE NOT NULL, -- e.g., 'electrical', 'plumbing'
    label       VARCHAR        NOT NULL, -- e.g., 'Electrical Services', 'Plumbing Services'
    description TEXT,
    icon        VARCHAR        NOT NULL, -- lucide icon name e.g., 'zap', 'wrench'
    color_class VARCHAR        NOT NULL, -- tailwind classes e.g., 'bg-yellow-100 text-yellow-800'
    is_active   BOOLEAN   DEFAULT true,
    sort_order  INTEGER   DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    created_by  UUID REFERENCES auth.users (id),
    updated_by  UUID REFERENCES auth.users (id)
);

-- Service locations table (replaces hardcoded KENYAN_LOCATIONS)
CREATE TABLE service_locations
(
    id         UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    name       VARCHAR UNIQUE NOT NULL, -- e.g., 'Nairobi CBD', 'Westlands'
    region     VARCHAR,                 -- e.g., 'Nairobi', 'Mombasa', 'Kisumu'
    county     VARCHAR,                 -- e.g., 'Nairobi County', 'Mombasa County'
    is_active  BOOLEAN   DEFAULT true,
    sort_order INTEGER   DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users (id),
    updated_by UUID REFERENCES auth.users (id)
);

-- System settings table for configurable values
CREATE TABLE system_settings
(
    id          UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    key         VARCHAR UNIQUE NOT NULL, -- e.g., 'min_budget', 'max_budget', 'platform_fee'
    value       JSONB          NOT NULL, -- flexible value storage
    description TEXT,
    category    VARCHAR        NOT NULL, -- e.g., 'pricing', 'features', 'limits'
    is_active   BOOLEAN   DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    created_by  UUID REFERENCES auth.users (id),
    updated_by  UUID REFERENCES auth.users (id)
);

-- =======================
-- SERVICE PLATFORM TABLES
-- =======================

-- Service providers table (with dynamic categories)
CREATE TABLE service_providers
(
    id                   UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
    name                 VARCHAR NOT NULL,
    email                VARCHAR NOT NULL UNIQUE,
    phone                VARCHAR NOT NULL,
    -- Old services column for backward compatibility
    services             TEXT[] NOT NULL DEFAULT '{}',
    -- New dynamic category system
    service_category_ids UUID[] NOT NULL DEFAULT '{}',
    location             VARCHAR NOT NULL,
    rating               NUMERIC DEFAULT 0 CHECK (rating >= 0:: numeric AND rating <= 5:: numeric
) ,
    total_jobs INTEGER DEFAULT 0,
    avatar TEXT,
    hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 100 AND hourly_rate <= 50000),
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    verification_requested_at TIMESTAMP,
    verification_notes TEXT,
    communication_preferences JSONB DEFAULT '{"call_availability": true, "sms_notifications": true, "email_notifications": true, "response_time_hours": 2, "preferred_contact_method": "phone"}'::jsonb,
    verification_status VARCHAR DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,
    blocked_at TIMESTAMP,
    admin_notes TEXT
);

-- Service requests table (with dynamic categories and locations)
CREATE TABLE service_requests
(
    id                  UUID             DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id             UUID    NOT NULL,
    provider_id         UUID,
    title               VARCHAR NOT NULL,
    description         TEXT    NOT NULL,
    -- Old columns for backward compatibility
    category            VARCHAR NOT NULL DEFAULT 'general_maintenance',
    location            VARCHAR NOT NULL DEFAULT 'Unknown Location',
    -- New dynamic system
    service_category_id UUID,
    service_location_id UUID,
    urgency             VARCHAR NOT NULL DEFAULT 'medium',
    status              VARCHAR NOT NULL DEFAULT 'pending',
    budget              INTEGER NOT NULL,
    created_at          TIMESTAMP        DEFAULT NOW(),
    updated_at          TIMESTAMP        DEFAULT NOW(),
    scheduled_date      TIMESTAMP,
    completed_at        TIMESTAMP,
    CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT service_requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES service_providers (id),
    CONSTRAINT fk_service_requests_category FOREIGN KEY (service_category_id) REFERENCES service_categories (id),
    CONSTRAINT fk_service_requests_location FOREIGN KEY (service_location_id) REFERENCES service_locations (id)
);

-- Reviews table
CREATE TABLE reviews
(
    id                 UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id UUID    NOT NULL,
    user_id            UUID    NOT NULL,
    provider_id        UUID    NOT NULL,
    rating             INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment            TEXT,
    created_at         TIMESTAMP DEFAULT NOW(),
    CONSTRAINT reviews_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES service_providers (id),
    CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT reviews_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES service_requests (id)
);

-- =======================
-- COMMUNICATION TABLES
-- =======================

-- Conversations table
CREATE TABLE conversations
(
    id                    UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id    UUID NOT NULL UNIQUE,
    user_id               UUID NOT NULL,
    provider_id           UUID NOT NULL,
    last_message_at       TIMESTAMP DEFAULT NOW(),
    user_unread_count     INTEGER   DEFAULT 0,
    provider_unread_count INTEGER   DEFAULT 0,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW(),
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT conversations_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES service_providers (id),
    CONSTRAINT conversations_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES service_requests (id)
);

-- Messages table
CREATE TABLE messages
(
    id                 UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id UUID    NOT NULL,
    sender_id          UUID    NOT NULL,
    sender_type        VARCHAR NOT NULL CHECK (sender_type IN ('user', 'provider')),
    content            TEXT    NOT NULL,
    message_type       VARCHAR   DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
    read_at            TIMESTAMP,
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW(),
    CONSTRAINT messages_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES service_requests (id)
);

-- =======================
-- ADMIN & MODERATION TABLES
-- =======================

-- Reports table
CREATE TABLE reports
(
    id                   UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id          UUID    NOT NULL,
    reported_user_id     UUID,
    reported_provider_id UUID,
    reported_request_id  UUID,
    report_type          VARCHAR NOT NULL CHECK (report_type IN
                                                 ('inappropriate_behavior', 'fraud', 'poor_service', 'harassment',
                                                  'fake_profile', 'other')),
    description          TEXT    NOT NULL,
    status               VARCHAR   DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes          TEXT,
    resolved_by          UUID,
    resolved_at          TIMESTAMP,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW(),
    CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES users (id),
    CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES users (id),
    CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES users (id),
    CONSTRAINT reports_reported_provider_id_fkey FOREIGN KEY (reported_provider_id) REFERENCES service_providers (id),
    CONSTRAINT reports_reported_request_id_fkey FOREIGN KEY (reported_request_id) REFERENCES service_requests (id)
);

-- =======================
-- INSERT DEFAULT DATA
-- =======================

-- Insert default service categories
INSERT INTO service_categories (value, label, description, icon, color_class, sort_order)
VALUES ('electrical', 'Electrical Services', 'Electrical repairs, installations, and maintenance', 'zap',
        'bg-yellow-100 text-yellow-800', 1),
       ('plumbing', 'Plumbing Services', 'Plumbing repairs, installations, and maintenance', 'wrench',
        'bg-blue-100 text-blue-800', 2),
       ('automotive', 'Car Services', 'Vehicle repairs, maintenance, and diagnostics', 'car',
        'bg-green-100 text-green-800', 3),
       ('hvac', 'HVAC Services', 'Heating, ventilation, and air conditioning services', 'wind',
        'bg-purple-100 text-purple-800', 4),
       ('carpentry', 'Carpentry', 'Wood work, furniture, and construction services', 'hammer',
        'bg-orange-100 text-orange-800', 5),
       ('painting', 'Painting', 'Interior and exterior painting services', 'paintbrush', 'bg-pink-100 text-pink-800',
        6),
       ('general_maintenance', 'General Maintenance', 'General repair and maintenance services', 'settings',
        'bg-gray-100 text-gray-800', 7);

-- Insert default service locations
INSERT INTO service_locations (name, region, county, sort_order)
VALUES ('Nairobi CBD', 'Nairobi', 'Nairobi County', 1),
       ('Westlands', 'Nairobi', 'Nairobi County', 2),
       ('Karen', 'Nairobi', 'Nairobi County', 3),
       ('Kilimani', 'Nairobi', 'Nairobi County', 4),
       ('Lavington', 'Nairobi', 'Nairobi County', 5),
       ('Parklands', 'Nairobi', 'Nairobi County', 6),
       ('Industrial Area', 'Nairobi', 'Nairobi County', 7),
       ('Eastleigh', 'Nairobi', 'Nairobi County', 8),
       ('Kasarani', 'Nairobi', 'Nairobi County', 9),
       ('Embakasi', 'Nairobi', 'Nairobi County', 10),
       ('Mombasa', 'Coast', 'Mombasa County', 11),
       ('Kisumu', 'Nyanza', 'Kisumu County', 12),
       ('Nakuru', 'Rift Valley', 'Nakuru County', 13),
       ('Eldoret', 'Rift Valley', 'Uasin Gishu County', 14),
       ('Thika', 'Central', 'Kiambu County', 15),
       ('Machakos', 'Eastern', 'Machakos County', 16);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category)
VALUES ('budget_limits', '{
  "min": 100,
  "max": 1000000
}', 'Minimum and maximum budget limits for service requests', 'pricing'),
       ('platform_fee_percent', '5', 'Platform fee percentage for transactions', 'pricing'),
       ('max_service_categories_per_provider', '5', 'Maximum number of categories a provider can select', 'limits'),
       ('request_auto_expire_days', '30', 'Days after which inactive requests auto-expire', 'features'),
       ('review_required_for_completion', 'true', 'Whether reviews are required for job completion', 'features'),
       ('provider_verification_required', 'true', 'Whether provider verification is mandatory', 'features');

-- Insert sample service providers
INSERT INTO service_providers (name, email, phone, services, service_category_ids, location, rating, total_jobs,
                               hourly_rate, bio, experience_years, verification_status)
VALUES ('John Mwangi', 'john.mwangi@email.com', '+254712345678',
        ARRAY['electrical', 'general_maintenance'],
        (SELECT ARRAY[
                        (SELECT id FROM service_categories WHERE value = 'electrical'),
                (SELECT id FROM service_categories WHERE value = 'general_maintenance') ]), 'Nairobi CBD', 4.8, 127, 1200, 'Certified electrician with over 8 years of experience in residential and commercial electrical work.', 8, 'approved'),
 
('Grace Wanjiku', 'grace.wanjiku@email.com', '+254723456789', 
 ARRAY['plumbing', 'hvac'], 
 (SELECT ARRAY[
    (SELECT id FROM service_categories WHERE value = 'plumbing'),
    (SELECT id FROM service_categories WHERE value = 'hvac')
 ]),
 'Westlands', 4.9, 89, 1500, 
 'Professional plumber specializing in modern plumbing systems and HVAC installations.', 6, 'approved'),
 
('David Kiptoo', 'david.kiptoo@email.com', '+254734567890', 
 ARRAY['automotive'], 
 (SELECT ARRAY[(SELECT id FROM service_categories WHERE value = 'automotive')]),
 'Industrial Area', 4.7, 203, 1800,
 'Mobile mechanic with expertise in all vehicle makes and models. Available 24/7 for emergency repairs.', 12, 'approved'),
 
('Mary Akinyi', 'mary.akinyi@email.com', '+254745678901', 
 ARRAY['carpentry', 'painting'], 
 (SELECT ARRAY[
    (SELECT id FROM service_categories WHERE value = 'carpentry'),
    (SELECT id FROM service_categories WHERE value = 'painting')
 ]),
 'Karen', 4.6, 156, 1300, 
 'Skilled carpenter and painter with a passion for transforming spaces.', 10, 'approved'),
 
('Peter Kimani', 'peter.kimani@email.com', '+254756789012', 
 ARRAY['electrical', 'hvac'], 
 (SELECT ARRAY[
    (SELECT id FROM service_categories WHERE value = 'electrical'),
    (SELECT id FROM service_categories WHERE value = 'hvac')
 ]),
 'Kilimani', 4.9, 78, 1400, 
 'Licensed electrician and HVAC technician. Quick response time and quality work guaranteed.', 5, 'approved'),
 
('Sarah Mutua', 'sarah.mutua@email.com', '+254767890123', 
 ARRAY['plumbing', 'general_maintenance'], 
 (SELECT ARRAY[
    (SELECT id FROM service_categories WHERE value = 'plumbing'),
    (SELECT id FROM service_categories WHERE value = 'general_maintenance')
 ]),
 'Lavington', 4.7, 92, 1250,
 'Reliable plumber and maintenance expert. Specializes in emergency repairs and installations.', 7, 'approved');

-- Add rate suggestion fields to service_categories table
ALTER TABLE service_categories
    ADD COLUMN rate_min INTEGER DEFAULT 500,
ADD COLUMN rate_typical INTEGER DEFAULT 1000,
ADD COLUMN rate_max INTEGER DEFAULT 2000;

-- Update existing categories with rate suggestions
UPDATE service_categories
SET rate_min     = 800,
    rate_typical = 1200,
    rate_max     = 2000
WHERE value = 'electrical';

UPDATE service_categories
SET rate_min     = 1000,
    rate_typical = 1500,
    rate_max     = 2500
WHERE value = 'plumbing';

UPDATE service_categories
SET rate_min     = 1200,
    rate_typical = 1800,
    rate_max     = 3000
WHERE value = 'automotive';

UPDATE service_categories
SET rate_min     = 1000,
    rate_typical = 1600,
    rate_max     = 2800
WHERE value = 'hvac';

UPDATE service_categories
SET rate_min     = 800,
    rate_typical = 1300,
    rate_max     = 2200
WHERE value = 'carpentry';

UPDATE service_categories
SET rate_min     = 600,
    rate_typical = 1000,
    rate_max     = 1800
WHERE value = 'painting';

UPDATE service_categories
SET rate_min     = 500,
    rate_typical = 900,
    rate_max     = 1500
WHERE value = 'general_maintenance';

-- =======================
-- ENABLE ROW LEVEL SECURITY
-- =======================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =======================
-- CREATE RLS POLICIES
-- =======================

-- Users policies
CREATE
POLICY "Users can view their own profile" ON users
    FOR
SELECT USING (auth.uid() = id);

CREATE
POLICY "Users can update their own profile" ON users
    FOR
UPDATE USING (auth.uid() = id);

CREATE
POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service providers policies
CREATE
POLICY "Everyone can view active service providers" ON service_providers
    FOR
SELECT USING (is_blocked = false);

CREATE
POLICY "Providers can update their own profile" ON service_providers
    FOR
UPDATE USING (auth.uid() = id);

CREATE
POLICY "Providers can insert their own profile" ON service_providers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service requests policies
CREATE
POLICY "Users can view their own requests" ON service_requests
    FOR
SELECT USING (auth.uid() = user_id);

CREATE
POLICY "Providers can view assigned requests" ON service_requests
    FOR
SELECT USING (auth.uid() = provider_id);

CREATE
POLICY "Users can create requests" ON service_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE
POLICY "Users can update their own requests" ON service_requests
    FOR
UPDATE USING (auth.uid() = user_id);

CREATE
POLICY "Providers can update assigned requests" ON service_requests
    FOR
UPDATE USING (auth.uid() = provider_id);

-- Reviews policies
CREATE
POLICY "Everyone can view reviews" ON reviews
    FOR
SELECT USING (true);

CREATE
POLICY "Users can create reviews for their completed requests" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations policies
CREATE
POLICY "Users can view their conversations" ON conversations
    FOR
SELECT USING (auth.uid() = user_id OR auth.uid() = provider_id);

CREATE
POLICY "System can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE
POLICY "Participants can update conversations" ON conversations
    FOR
UPDATE USING (auth.uid() = user_id OR auth.uid() = provider_id);

-- Messages policies
CREATE
POLICY "Conversation participants can view messages" ON messages
    FOR
SELECT USING (
    EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.service_request_id = messages.service_request_id
    AND (c.user_id = auth.uid() OR c.provider_id = auth.uid())
    )
    );

CREATE
POLICY "Conversation participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.service_request_id = messages.service_request_id
            AND (c.user_id = auth.uid() OR c.provider_id = auth.uid())
        )
        AND auth.uid() = sender_id
    );

-- Reports policies
CREATE
POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE
POLICY "Admins can view and manage reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Dynamic data policies
CREATE
POLICY "Everyone can view active categories" ON service_categories
    FOR
SELECT USING (is_active = true);

CREATE
POLICY "Admins can manage categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

CREATE
POLICY "Everyone can view active locations" ON service_locations
    FOR
SELECT USING (is_active = true);

CREATE
POLICY "Admins can manage locations" ON service_locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

CREATE
POLICY "Everyone can view active settings" ON system_settings
    FOR
SELECT USING (is_active = true);

CREATE
POLICY "Admins can manage settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- =======================
-- CREATE INDEXES FOR PERFORMANCE
-- =======================

-- Core table indexes
CREATE INDEX idx_users_is_admin ON users (is_admin);
CREATE INDEX idx_users_is_blocked ON users (is_blocked);
CREATE INDEX idx_service_providers_location ON service_providers (location);
CREATE INDEX idx_service_providers_rating ON service_providers (rating DESC);
CREATE INDEX idx_service_providers_verification ON service_providers (verification_status);
CREATE INDEX idx_service_providers_is_blocked ON service_providers (is_blocked);
CREATE INDEX idx_service_requests_user_id ON service_requests (user_id);
CREATE INDEX idx_service_requests_provider_id ON service_requests (provider_id);
CREATE INDEX idx_service_requests_status ON service_requests (status);
CREATE INDEX idx_reviews_provider_id ON reviews (provider_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_provider_id ON conversations (provider_id);
CREATE INDEX idx_messages_service_request_id ON messages (service_request_id);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_report_type ON reports (report_type);
CREATE INDEX idx_service_categories_rates ON service_categories (rate_typical DESC) WHERE is_active = true;

-- Dynamic system indexes
CREATE INDEX idx_service_categories_active ON service_categories (is_active, sort_order);
CREATE INDEX idx_service_categories_value ON service_categories (value) WHERE is_active = true;
CREATE INDEX idx_service_locations_active ON service_locations (is_active, sort_order);
CREATE INDEX idx_service_locations_region ON service_locations (region) WHERE is_active = true;
CREATE INDEX idx_system_settings_category ON system_settings (category) WHERE is_active = true;
CREATE INDEX idx_system_settings_key ON system_settings (key) WHERE is_active = true;
CREATE INDEX idx_service_providers_categories ON service_providers USING GIN(service_category_ids);
CREATE INDEX idx_service_requests_category ON service_requests (service_category_id);
CREATE INDEX idx_service_requests_location ON service_requests (service_location_id);

-- =======================
-- CREATE HELPER FUNCTIONS AND TRIGGERS
-- =======================

-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at
= NOW();
    -- For dynamic tables, also update updated_by
    IF
TG_TABLE_NAME IN ('service_categories', 'service_locations', 'system_settings') THEN
        NEW.updated_by = auth.uid();
END IF;
RETURN NEW;
END;
$$
language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE
    ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE
    ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE
    ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE
    ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE
    ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE
    ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_locations_updated_at
    BEFORE UPDATE
    ON service_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE
    ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- CREATE HELPER VIEWS
-- =======================

-- Active service categories view
CREATE VIEW active_service_categories AS
SELECT *
FROM service_categories
WHERE is_active = true
ORDER BY sort_order, label;

-- Active service locations view
CREATE VIEW active_service_locations AS
SELECT *
FROM service_locations
WHERE is_active = true
ORDER BY sort_order, name;

-- Provider with categories view
CREATE VIEW provider_categories_view AS
SELECT sp.id                                      as provider_id,
       sp.name                                    as provider_name,
       sp.location,
       sp.rating,
       sp.hourly_rate,
       sp.verification_status,
       array_agg(sc.label ORDER BY sc.sort_order) as category_labels,
       array_agg(sc.value ORDER BY sc.sort_order) as category_values,
       array_agg(sc.id ORDER BY sc.sort_order)    as category_ids
FROM service_providers sp
         LEFT JOIN service_categories sc ON sc.id = ANY (sp.service_category_ids)
WHERE sc.is_active = true
   OR sc.id IS NULL
GROUP BY sp.id, sp.name, sp.location, sp.rating, sp.hourly_rate, sp.verification_status;

-- Service providers with verified status (for backward compatibility)
CREATE VIEW service_providers_with_verified AS
SELECT sp.*,
       -- Map verification_status to boolean for backward compatibility
       CASE
           WHEN verification_status = 'approved' THEN true
           ELSE false
           END as verified
FROM service_providers sp;

-- Admin dashboard statistics view
CREATE VIEW admin_stats AS
SELECT (SELECT COUNT(*) FROM users WHERE is_blocked = false)                          as total_users,
       (SELECT COUNT(*) FROM service_providers WHERE is_blocked = false)              as total_providers,
       (SELECT COUNT(*) FROM service_providers WHERE verification_status = 'pending') as pending_verifications,
       (SELECT COUNT(*) FROM reports WHERE status = 'pending')                        as pending_reports,
       (SELECT COUNT(*) FROM service_requests WHERE status = 'pending')               as pending_requests,
       (SELECT COUNT(*) FROM service_requests WHERE status = 'completed')             as completed_requests;

-- =======================
-- VERIFICATION AND SUMMARY
-- =======================

DO
$$
BEGIN
    RAISE
NOTICE '=== DATABASE SETUP COMPLETE ===';
    RAISE
NOTICE 'Tables created: %', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    );
    RAISE
NOTICE 'Views created: %', (
        SELECT COUNT(*) FROM information_schema.views 
        WHERE table_schema = 'public'
    );
    RAISE
NOTICE 'Service categories: %', (SELECT COUNT(*) FROM service_categories);
    RAISE
NOTICE 'Service locations: %', (SELECT COUNT(*) FROM service_locations);
    RAISE
NOTICE 'System settings: %', (SELECT COUNT(*) FROM system_settings);
    RAISE
NOTICE 'Sample providers: %', (SELECT COUNT(*) FROM service_providers);
    RAISE
NOTICE '';
    RAISE
NOTICE '=== NEXT STEPS ===';
    RAISE
NOTICE '1. Create your first admin user in the Supabase Auth dashboard';
    RAISE
NOTICE '2. Update the admin user record: UPDATE users SET is_admin = true WHERE email = ''your-admin@email.com''';
    RAISE
NOTICE '3. Test the dynamic data system with your application';
    RAISE
NOTICE '4. Deploy the admin management interface';
    RAISE
NOTICE '5. Begin migrating from hardcoded constants to dynamic data';
END
$$;

COMMIT;

-- Sample queries to verify setup
SELECT 'Active Categories:' as info;
SELECT value, label, icon, color_class
FROM active_service_categories LIMIT 3;

SELECT 'Active Locations:' as info;
SELECT name, region, county
FROM active_service_locations LIMIT 3;

SELECT 'Sample Providers with Categories:' as info;
SELECT provider_name, category_labels, verification_status
FROM provider_categories_view LIMIT 3;

SELECT 'Admin Stats:' as info;
SELECT *
FROM admin_stats;