-- Liquibase formatted SQL

-- Create the 'users' table
--changeset yourname:001
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL
);

-- Create the 'authorities' table
--changeset yourname:002
CREATE TABLE authorities (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  authority VARCHAR(50) NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username)
);
