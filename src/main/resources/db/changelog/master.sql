-- liquibase formatted sql

-- changeset author:yourname:1
CREATE TABLE users (
    username VARCHAR(50) NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL
);

CREATE TABLE authorities (
    username VARCHAR(50) NOT NULL,
    authority VARCHAR(50) NOT NULL,
    CONSTRAINT fk_authorities_users FOREIGN KEY (username) REFERENCES users(username)
);
CREATE UNIQUE INDEX ix_auth_username ON authorities (username, authority);

-- changeset author:yourname:2
CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INT NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100),
    CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX spring_session_ix1 ON spring_session (session_id);
CREATE INDEX spring_session_ix2 ON spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session (principal_name);

CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);

-- changeset author:yourname:3

INSERT INTO users (username, password, enabled)
VALUES ('admin', '$2a$12$dhNCXRXqmV.7iZYBowpvfOKDfbQaUn15zgmzS2uSxdDpVJahZKCHm', true);
INSERT INTO users (username, password, enabled)
VALUES ('user', '$2a$12$dhNCXRXqmV.7iZYBowpvfOKDfbQaUn15zgmzS2uSxdDpVJahZKCHm', true);

INSERT INTO authorities (username, authority)
VALUES ('admin', 'ROLE_ADMIN');
INSERT INTO authorities (username, authority)
VALUES ('user', 'ROLE_USER');


-- changeset author:yourname:4
CREATE TABLE consult_history (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    creation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT,
    letter TEXT,
    username VARCHAR(255) NOT NULL
);

CREATE INDEX idx_consult_history_username ON consult_history(username);
CREATE INDEX idx_consult_history_session_id ON consult_history(session_id);