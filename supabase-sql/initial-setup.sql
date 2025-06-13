-- Enable necessary extensions
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users
(
    id         UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    name       VARCHAR        NOT NULL,
    email      VARCHAR UNIQUE NOT NULL,
    phone      VARCHAR        NOT NULL,
    location   VARCHAR        NOT NULL,
    avatar     TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service providers table
CREATE TABLE service_providers
(
    id               UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    name             VARCHAR        NOT NULL,
    email            VARCHAR UNIQUE NOT NULL,
    phone            VARCHAR        NOT NULL,
    services         TEXT[] NOT NULL,
    location         VARCHAR        NOT NULL,
    rating           DECIMAL   DEFAULT 0,
    total_jobs       INTEGER   DEFAULT 0,
    verified         BOOLEAN   DEFAULT FALSE,
    avatar           TEXT,
    hourly_rate      INTEGER        NOT NULL,
    bio              TEXT,
    experience_years INTEGER   DEFAULT 0,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- Service requests table
CREATE TABLE service_requests
(
    id             UUID                                DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id        UUID REFERENCES users (id) NOT NULL,
    provider_id    UUID REFERENCES service_providers (id),
    title          VARCHAR                    NOT NULL,
    description    TEXT                       NOT NULL,
    category       VARCHAR                    NOT NULL,
    location       VARCHAR                    NOT NULL,
    urgency        VARCHAR                    NOT NULL DEFAULT 'medium',
    status         VARCHAR                    NOT NULL DEFAULT 'pending',
    budget         INTEGER                    NOT NULL,
    created_at     TIMESTAMP                           DEFAULT NOW(),
    updated_at     TIMESTAMP                           DEFAULT NOW(),
    scheduled_date TIMESTAMP,
    completed_at   TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews
(
    id                 UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_request_id UUID REFERENCES service_requests (id)       NOT NULL,
    user_id            UUID REFERENCES users (id)                  NOT NULL,
    provider_id        UUID REFERENCES service_providers (id)      NOT NULL,
    rating             INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment            TEXT,
    created_at         TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
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

-- Create policies for service_providers table
CREATE
POLICY "Everyone can view service providers" ON service_providers
  FOR
SELECT USING (true);

CREATE
POLICY "Service providers can update their own profile" ON service_providers
  FOR
UPDATE USING (auth.uid() = id);

CREATE
POLICY "Service providers can insert their own profile" ON service_providers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for service_requests table
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

-- Create policies for reviews table
CREATE
POLICY "Everyone can view reviews" ON reviews
  FOR
SELECT USING (true);

CREATE
POLICY "Users can create reviews for their completed requests" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO service_providers (name, email, phone, services, location, rating, total_jobs, verified, hourly_rate, bio,
                               experience_years)
VALUES ('John Mwangi', 'john.mwangi@email.com', '+254712345678', ARRAY['electrical', 'general_maintenance'],
        'Nairobi CBD', 4.8, 127, true, 1200,
        'Certified electrician with over 8 years of experience in residential and commercial electrical work.', 8),
       ('Grace Wanjiku', 'grace.wanjiku@email.com', '+254723456789', ARRAY['plumbing', 'hvac'], 'Westlands', 4.9, 89,
        true, 1500, 'Professional plumber specializing in modern plumbing systems and HVAC installations.', 6),
       ('David Kiptoo', 'david.kiptoo@email.com', '+254734567890', ARRAY['automotive'], 'Industrial Area', 4.7, 203,
        true, 1800,
        'Mobile mechanic with expertise in all vehicle makes and models. Available 24/7 for emergency repairs.', 12),
       ('Mary Akinyi', 'mary.akinyi@email.com', '+254745678901', ARRAY['carpentry', 'painting'], 'Karen', 4.6, 156,
        true, 1300, 'Skilled carpenter and painter with a passion for transforming spaces.', 10),
       ('Peter Kimani', 'peter.kimani@email.com', '+254756789012', ARRAY['electrical', 'hvac'], 'Kilimani', 4.9, 78,
        true, 1400, 'Licensed electrician and HVAC technician. Quick response time and quality work guaranteed.', 5),
       ('Sarah Mutua', 'sarah.mutua@email.com', '+254767890123', ARRAY['plumbing', 'general_maintenance'], 'Lavington',
        4.7, 92, true, 1250,
        'Reliable plumber and maintenance expert. Specializes in emergency repairs and installations.', 7);

-- Create indexes for better performance
CREATE INDEX idx_service_providers_services ON service_providers USING GIN(services);
CREATE INDEX idx_service_providers_location ON service_providers (location);
CREATE INDEX idx_service_requests_user_id ON service_requests (user_id);
CREATE INDEX idx_service_requests_provider_id ON service_requests (provider_id);
CREATE INDEX idx_service_requests_status ON service_requests (status);
CREATE INDEX idx_service_requests_category ON service_requests (category);

-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at
= NOW();
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