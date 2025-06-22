INSERT INTO users(email, role)
VALUES ('admin@example.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role='admin';
