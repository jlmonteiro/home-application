INSERT INTO profiles.user (email, first_name, last_name, enabled) VALUES
('existing@example.com', 'John', 'Doe', true),
('withprofile@example.com', 'Jane', 'Smith', true);

INSERT INTO profiles.user_profile (user_id, photo, facebook, mobile_phone, instagram, linkedin) VALUES
((SELECT id FROM profiles.user WHERE email = 'existing@example.com'), 'photo.jpg', 'facebook.com/john', '+1234567890', 'instagram.com/john', 'linkedin.com/john'),
((SELECT id FROM profiles.user WHERE email = 'withprofile@example.com'), 'photo.jpg', 'facebook.com/jane', '+1234567890', 'instagram.com/jane', 'linkedin.com/jane');
