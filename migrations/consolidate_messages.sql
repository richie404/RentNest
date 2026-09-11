-- Existing installations only. Back up the database and STOP all application
-- instances and both chat servers before running. Keep them stopped until done.
-- Run with the mysql client against the selected RentNest database, without --force.
-- No existing messages rows are updated or deleted. Foreign keys remain enabled.
-- Identical cross-table records are ambiguous: the default call refuses to guess.
-- After reviewing overlaps, set the final argument to TRUE only if identical
-- fields represent copies of the same messages. Repeated identical messages are
-- matched one-for-one, preserving the greater occurrence count across tables.

DELIMITER //
CREATE PROCEDURE rentnest_consolidate_messages(IN reviewed_overlaps BOOLEAN)
main: BEGIN
    DECLARE source_count BIGINT DEFAULT 0;
    DECLARE before_count BIGINT DEFAULT 0;
    DECLARE pending_count BIGINT DEFAULT 0;
    DECLARE after_count BIGINT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS rentnest_pending_messages;
        RESIGNAL;
    END;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = DATABASE() AND table_name = 'socket_messages') THEN
        SELECT 'Already consolidated; no legacy table exists' AS result;
        LEAVE main;
    END IF;
    IF (SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name IN ('messages', 'socket_messages')
          AND engine = 'InnoDB') <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Both message tables must use InnoDB';
    END IF;
    IF @@foreign_key_checks <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Enable foreign key checks before migration';
    END IF;

    SHOW CREATE TABLE messages;
    SHOW CREATE TABLE socket_messages;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;
    SELECT COUNT(*) INTO before_count FROM messages;
    SELECT COUNT(*) INTO source_count FROM socket_messages;
    SELECT before_count AS existing_messages, source_count AS legacy_messages;

    IF NOT reviewed_overlaps AND EXISTS (
        SELECT 1 FROM socket_messages s JOIN messages m
          ON m.listing_id <=> s.listing_id
         AND m.sender_id = s.sender_id AND m.receiver_id = s.receiver_id
         AND BINARY m.message_text = BINARY s.message_text
         AND m.timestamp <=> s.timestamp
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cross-table overlaps found; review identity before enabling overlap matching';
    END IF;

    CREATE TEMPORARY TABLE rentnest_pending_messages LIKE socket_messages;
    INSERT INTO rentnest_pending_messages
    SELECT s.* FROM socket_messages s
    WHERE (SELECT COUNT(*) FROM messages m
           WHERE m.listing_id <=> s.listing_id
             AND m.sender_id = s.sender_id AND m.receiver_id = s.receiver_id
             AND BINARY m.message_text = BINARY s.message_text
             AND m.timestamp <=> s.timestamp)
        < (SELECT COUNT(*) FROM socket_messages earlier
           WHERE earlier.id <= s.id AND earlier.listing_id <=> s.listing_id
             AND earlier.sender_id = s.sender_id AND earlier.receiver_id = s.receiver_id
             AND BINARY earlier.message_text = BINARY s.message_text
             AND earlier.timestamp <=> s.timestamp);
    SELECT COUNT(*) INTO pending_count FROM rentnest_pending_messages;

    INSERT INTO messages (listing_id, sender_id, receiver_id, message_text, timestamp)
    SELECT listing_id, sender_id, receiver_id, message_text, timestamp
    FROM rentnest_pending_messages ORDER BY id;

    SELECT COUNT(*) INTO after_count FROM messages;
    IF after_count <> before_count + pending_count OR EXISTS (
        SELECT 1 FROM socket_messages s
        WHERE (SELECT COUNT(*) FROM messages m
               WHERE m.listing_id <=> s.listing_id
                 AND m.sender_id = s.sender_id AND m.receiver_id = s.receiver_id
                 AND BINARY m.message_text = BINARY s.message_text
                 AND m.timestamp <=> s.timestamp)
            < (SELECT COUNT(*) FROM socket_messages other
               WHERE other.listing_id <=> s.listing_id
                 AND other.sender_id = s.sender_id AND other.receiver_id = s.receiver_id
                 AND BINARY other.message_text = BINARY s.message_text
                 AND other.timestamp <=> s.timestamp)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Migration verification failed; legacy table retained';
    END IF;
    COMMIT;
    -- DDL commits independently. If interrupted here, the source remains intact;
    -- review the completed copy and rerun with reviewed_overlaps=TRUE.
    DROP TABLE socket_messages;
    DROP TEMPORARY TABLE rentnest_pending_messages;
    SELECT pending_count AS migrated_messages, source_count - pending_count AS matched_copies,
           after_count AS total_messages;
END//
DELIMITER ;

CALL rentnest_consolidate_messages(FALSE);
DROP PROCEDURE rentnest_consolidate_messages;
