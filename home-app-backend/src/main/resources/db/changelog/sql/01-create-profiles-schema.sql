--liquibase formatted sql

--changeset jorge:01-create-profiles-schema
CREATE SCHEMA IF NOT EXISTS profiles;
--rollback DROP SCHEMA IF EXISTS profiles CASCADE;
