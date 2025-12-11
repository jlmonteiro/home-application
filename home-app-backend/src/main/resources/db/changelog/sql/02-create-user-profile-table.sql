--liquibase formatted sql

--changeset jorge:create-user-profile-table
CREATE TABLE profiles.user_profile (
    user_email VARCHAR(100) PRIMARY KEY,
    photo TEXT,
    facebook VARCHAR(255),
    mobile_phone VARCHAR(20),
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    CONSTRAINT fk_user_profile_user FOREIGN KEY (user_email) REFERENCES profiles.user(email) ON DELETE CASCADE
);

CREATE INDEX idx_user_profile_mobile_phone ON profiles.user_profile(mobile_phone);

--rollback DROP TABLE profiles.user_profile;