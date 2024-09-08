-- Liquibase formatted SQL

-- Insert admin user
--changeset yourname:003
INSERT INTO users (id, username, password, enabled)
VALUES (1, 'admin', '$2a$10$8gtnGGyy3qFq0M0PyHi7q.iazySIxoxbK5W8uqsqZn.0C/vtsos.C', true);

-- Grant admin role to the admin user
--changeset yourname:004
INSERT INTO authorities (id, username, authority)
VALUES (1, 'admin', 'ROLE_ADMIN');
