-- Clear existing data to ensure exact counts
DELETE FROM profiles.user_profile;
DELETE FROM profiles.user;

-- Insert 20 users
INSERT INTO profiles.user (id, email, first_name, last_name, enabled) VALUES
(101, 'user01@example.com', 'User01', 'Test', true),
(102, 'user02@example.com', 'User02', 'Test', true),
(103, 'user03@example.com', 'User03', 'Test', true),
(104, 'user04@example.com', 'User04', 'Test', true),
(105, 'user05@example.com', 'User05', 'Test', true),
(106, 'user06@example.com', 'User06', 'Test', true),
(107, 'user07@example.com', 'User07', 'Test', true),
(108, 'user08@example.com', 'User08', 'Test', true),
(109, 'user09@example.com', 'User09', 'Test', true),
(110, 'user10@example.com', 'User10', 'Test', true),
(111, 'user11@example.com', 'User11', 'Test', true),
(112, 'user12@example.com', 'User12', 'Test', true),
(113, 'user13@example.com', 'User13', 'Test', true),
(114, 'user14@example.com', 'User14', 'Test', true),
(115, 'user15@example.com', 'User15', 'Test', true),
(116, 'user16@example.com', 'User16', 'Test', true),
(117, 'user17@example.com', 'User17', 'Test', true),
(118, 'user18@example.com', 'User18', 'Test', true),
(119, 'user19@example.com', 'User19', 'Test', true),
(120, 'user20@example.com', 'User20', 'Test', true);

-- Insert corresponding profiles
INSERT INTO profiles.user_profile (id, user_id, photo, facebook, mobile_phone, instagram, linkedin) VALUES
(201, 101, 'photo01.jpg', 'fb.com/u01', '111-001', 'inst.com/u01', 'li.com/u01'),
(202, 102, 'photo02.jpg', 'fb.com/u02', '111-002', 'inst.com/u02', 'li.com/u02'),
(203, 103, 'photo03.jpg', 'fb.com/u03', '111-003', 'inst.com/u03', 'li.com/u03'),
(204, 104, 'photo04.jpg', 'fb.com/u04', '111-004', 'inst.com/u04', 'li.com/u04'),
(205, 105, 'photo05.jpg', 'fb.com/u05', '111-005', 'inst.com/u05', 'li.com/u05'),
(206, 106, 'photo06.jpg', 'fb.com/u06', '111-006', 'inst.com/u06', 'li.com/u06'),
(207, 107, 'photo07.jpg', 'fb.com/u07', '111-007', 'inst.com/u07', 'li.com/u07'),
(208, 108, 'photo08.jpg', 'fb.com/u08', '111-008', 'inst.com/u08', 'li.com/u08'),
(209, 109, 'photo09.jpg', 'fb.com/u09', '111-009', 'inst.com/u09', 'li.com/u09'),
(210, 110, 'photo10.jpg', 'fb.com/u10', '111-010', 'inst.com/u10', 'li.com/u10'),
(211, 111, 'photo11.jpg', 'fb.com/u11', '111-011', 'inst.com/u11', 'li.com/u11'),
(212, 112, 'photo12.jpg', 'fb.com/u12', '111-012', 'inst.com/u12', 'li.com/u12'),
(213, 113, 'photo13.jpg', 'fb.com/u13', '111-013', 'inst.com/u13', 'li.com/u13'),
(214, 114, 'photo14.jpg', 'fb.com/u14', '111-014', 'inst.com/u14', 'li.com/u14'),
(215, 115, 'photo15.jpg', 'fb.com/u15', '111-015', 'inst.com/u15', 'li.com/u15'),
(216, 116, 'photo16.jpg', 'fb.com/u16', '111-016', 'inst.com/u16', 'li.com/u16'),
(217, 117, 'photo17.jpg', 'fb.com/u17', '111-017', 'inst.com/u17', 'li.com/u17'),
(218, 118, 'photo18.jpg', 'fb.com/u18', '111-018', 'inst.com/u18', 'li.com/u18'),
(219, 119, 'photo19.jpg', 'fb.com/u19', '111-019', 'inst.com/u19', 'li.com/u19'),
(220, 120, 'photo20.jpg', 'fb.com/u20', '111-020', 'inst.com/u20', 'li.com/u20');
