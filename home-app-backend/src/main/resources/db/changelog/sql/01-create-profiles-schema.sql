--liquibase formatted sql

--changeset jorge:01-create-profiles-schema-and-users-table
CREATE SCHEMA IF NOT EXISTS profiles;

CREATE TABLE profiles.user (
    email VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT true
);

--rollback DROP TABLE IF EXISTS profiles.users CASCADE; DROP SCHEMA IF EXISTS profiles CASCADE;
