-- NULL retains existing messages without inventing retry identities.
ALTER TABLE messages
  ADD COLUMN client_message_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD UNIQUE KEY uq_messages_sender_request (sender_id, client_message_id);
