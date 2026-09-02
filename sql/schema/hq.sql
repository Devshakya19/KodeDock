-- =============================================================================
-- KODEDOCK HQ OPERATING SYSTEM & RBAC
-- =============================================================================

CREATE TABLE IF NOT EXISTS hq_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hq_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES hq_roles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id)
);

CREATE TABLE IF NOT EXISTS hq_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES hq_roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_ip VARCHAR(45),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hq_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES hq_staff(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_resource_id VARCHAR(255),
    reason TEXT,
    ip_address VARCHAR(45),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default System Roles
INSERT INTO hq_roles (id, name, description, is_system_role) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'OWNER', 'Absolute System Authority. Do not delete.', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'ADMIN', 'Operational second-in-command.', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Grant wildcard permission to OWNER
INSERT INTO hq_role_permissions (role_id, permissions)
VALUES ('00000000-0000-0000-0000-000000000001', '["*"]')
ON CONFLICT (role_id) DO NOTHING;
