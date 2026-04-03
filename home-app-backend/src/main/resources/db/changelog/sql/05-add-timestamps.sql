--liquibase formatted sql

--changeset jorge:add-timestamps
ALTER TABLE profiles.user
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE profiles.user_profile
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

--rollback ALTER TABLE profiles.user_profile DROP COLUMN created_at, DROP COLUMN updated_at;
--rollback ALTER TABLE profiles.user DROP COLUMN created_at, DROP COLUMN updated_at;
