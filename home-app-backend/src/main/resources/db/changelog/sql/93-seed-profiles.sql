-- liquibase formatted sql

-- changeset consolidated:93-seed-profiles
-- 1. Insert User
INSERT INTO profiles.user (email, first_name, last_name, enabled, version) VALUES
('jorgemonteiro@gmail.com', 'Jorge', 'Monteiro', true, 0)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert User Profile
INSERT INTO profiles.user_profile (user_id, photo, facebook, mobile_phone, instagram, linkedin, birthdate, family_role_id, age_group_name, version) VALUES
((SELECT id FROM profiles.user WHERE email = 'jorgemonteiro@gmail.com'),
 'user-1-profile.jpeg',
 'https://www.facebook.com/jorgeluiz.monteiro.353',
 '+353 087 783 8273',
 'https://www.instagram.com/jlmonteiro/',
 'https://www.linkedin.com/in/jorge-luiz-monteiro-a3449524/',
 '1980-12-21',
 (SELECT id FROM profiles.family_roles WHERE name = 'Father'),
 'Adult',
 0)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert User Preferences
INSERT INTO profiles.user_preferences (user_id, show_shopping_widget, show_coupons_widget, version) VALUES
((SELECT id FROM profiles.user WHERE email = 'jorgemonteiro@gmail.com'), true, true, 0)
ON CONFLICT (user_id) DO NOTHING;
