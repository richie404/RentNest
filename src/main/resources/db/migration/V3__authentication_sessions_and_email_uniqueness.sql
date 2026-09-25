-- No passwords are rewritten here. BCrypt strings (60 characters) fit CHAR(64).
-- This statement fails without merging/deleting users if normalization collides.
ALTER TABLE users
  ADD COLUMN email_normalized VARCHAR(100) GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
  ADD UNIQUE KEY uq_users_email_normalized (email_normalized);

CREATE TABLE auth_sessions (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_auth_sessions_user (user_id),
  KEY idx_auth_sessions_expiry (expires_at),
  CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
