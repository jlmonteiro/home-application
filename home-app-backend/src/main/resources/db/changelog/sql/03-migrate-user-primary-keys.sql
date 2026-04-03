--liquibase formatted sql

--changeset jorge:migrate-user-primary-keys
-- Add new id columns (auto-populated by sequence)
ALTER TABLE profiles.user ADD COLUMN id BIGSERIAL;
ALTER TABLE profiles.user_profile ADD COLUMN id BIGSERIAL;
ALTER TABLE profiles.user_profile ADD COLUMN user_id BIGINT;

-- Populate user_id from matching user email
UPDATE profiles.user_profile up
SET user_id = (SELECT u.id FROM profiles.user u WHERE u.email = up.user_email);

-- Enforce NOT NULL on user_id now that values are populated
ALTER TABLE profiles.user_profile ALTER COLUMN user_id SET NOT NULL;

-- Drop old foreign key constraint
ALTER TABLE profiles.user_profile DROP CONSTRAINT IF EXISTS fk_user_profile_user;

-- Drop old primary keys
ALTER TABLE profiles.user_profile DROP CONSTRAINT IF EXISTS user_profile_pkey;
ALTER TABLE profiles.user DROP CONSTRAINT IF EXISTS user_pkey;

-- Set new primary keys
ALTER TABLE profiles.user ADD PRIMARY KEY (id);
ALTER TABLE profiles.user_profile ADD PRIMARY KEY (id);

-- Add unique constraint on email (was previously the PK)
ALTER TABLE profiles.user ADD CONSTRAINT uk_user_email UNIQUE (email);

-- Add new foreign key using user_id
ALTER TABLE profiles.user_profile
    ADD CONSTRAINT fk_user_profile_user
    FOREIGN KEY (user_id) REFERENCES profiles.user(id) ON DELETE CASCADE;

-- Enforce one-to-one relationship
ALTER TABLE profiles.user_profile ADD CONSTRAINT uk_user_profile_user_id UNIQUE (user_id);

-- Drop the old user_email column (email is now accessed via the user join)
ALTER TABLE profiles.user_profile DROP COLUMN user_email;

-- Create index on user.email for fast lookup
CREATE INDEX idx_user_email ON profiles.user(email);

--rollback DROP INDEX IF EXISTS idx_user_email;
--rollback ALTER TABLE profiles.user_profile ADD COLUMN user_email VARCHAR(100);
--rollback UPDATE profiles.user_profile up SET user_email = (SELECT u.email FROM profiles.user u WHERE u.id = up.user_id);
--rollback ALTER TABLE profiles.user_profile ALTER COLUMN user_email SET NOT NULL;
--rollback ALTER TABLE profiles.user_profile DROP CONSTRAINT uk_user_profile_user_id;
--rollback ALTER TABLE profiles.user_profile DROP CONSTRAINT fk_user_profile_user;
--rollback ALTER TABLE profiles.user DROP CONSTRAINT uk_user_email;
--rollback ALTER TABLE profiles.user_profile DROP CONSTRAINT user_profile_pkey;
--rollback ALTER TABLE profiles.user DROP CONSTRAINT user_pkey;
--rollback ALTER TABLE profiles.user ADD PRIMARY KEY (email);
--rollback ALTER TABLE profiles.user_profile ADD PRIMARY KEY (user_email);
--rollback ALTER TABLE profiles.user_profile ADD CONSTRAINT fk_user_profile_user FOREIGN KEY (user_email) REFERENCES profiles.user(email) ON DELETE CASCADE;
--rollback ALTER TABLE profiles.user_profile DROP COLUMN user_id;
--rollback ALTER TABLE profiles.user_profile DROP COLUMN id;
--rollback ALTER TABLE profiles.user DROP COLUMN id;
