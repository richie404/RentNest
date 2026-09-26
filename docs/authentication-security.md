# Phase 7: authentication and authorization audit

## Findings and fixes

| Finding | Files and resolution |
| --- | --- |
| New passwords used fast unsalted SHA-256 | AuthenticationService now uses PasswordHasher with the existing org.mindrot:jbcrypt:0.4 dependency, random salts and cost 12. No new dependency was needed. Removed the unused competing PasswordUtil implementation. |
| Confirm-password field was ignored | RegisterController binds the existing FXML field and passes it to the service. The service rejects mismatches; there is no four-argument registration bypass. No form redesign. |
| Email normalization and concurrent duplicates | Service normalizes trim/lowercase with Locale.ROOT. DAO credential lookups normalize legacy stored addresses. V3 adds a generated normalized-email unique key; duplicate insert races become a domain error. Ambiguous legacy matches fail closed. |
| Duplicate/mutable session stores | Removed UserStore and the arbitrary-user session setter. SessionManager.login verifies credentials before issuing a session; returned User models cannot replace session identity. Session data contains no password. |
| Logout left chat identity/listeners alive | Logout clears local identity, closes the socket, removes listeners and revokes the database token. A previous socket reader cannot disconnect a replacement connection. |
| Claimed-ID socket authentication | Both servers now require an opaque session token and validate the persisted account/session before each send and delivery. A sender ID must match the authenticated user. Legacy ID-only handshakes are rejected. |
| Legacy chat broadcast disclosed messages | ChatServer forwards only to the authenticated receiver. Removed private-message content logging. |
| Stale roles/banned accounts | ServiceAccess and token checks use current persisted role/status. Admin bans and role changes revoke sessions atomically with moderation/audit writes. Expired/revoked sessions fail closed. |
| Controller-only authorization | Reviewed controller and service paths. Admin commands require ADMIN; listing edits check the stored owner; booking changes check the participant and permitted transition. Calling controllers manually cannot bypass these services. |
| SQL injection | Production SQL goes through JdbcDAO PreparedStatements. Dynamic SQL contains fixed projections or generated placeholder counts; values are bound. No raw Statement or SQL in controllers. Injection input is tested as data. |

The live read-only inventory at audit time found 13 SHA-256 accounts and no
normalized-email collision groups. No live password, account or schema was changed.

## Existing-password migration

Authentication recognizes exactly a 64-hex legacy SHA-256 digest or supported
BCrypt representation. Successful legacy login upgrades using a compare-and-set
UPDATE so a concurrent password change cannot be overwritten. Incorrect passwords
and banned accounts are not upgraded. BCrypt is 60 characters and fits the existing
CHAR(64) column; no password-column migration or batch rehash is necessary.

New passwords require 8 characters and at most 72 UTF-8 bytes; NUL is rejected.
This prevents BCrypt's length limit from silently discarding a suffix. Existing
legacy passwords exceeding that byte limit or containing NUL still authenticate
using the complete legacy digest and remain unchanged until a password reset can
choose a compatible password. They are never truncated into BCrypt. A reset flow
does not currently exist and is not invented here. Passwords are not trimmed.

Implementation references: [jBCrypt API](https://www.mindrot.org/projects/jBCrypt/)
and [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## V3 migration and sessions

Apply V3 before using the new desktop login/chat protocol. auth_sessions stores only
SHA-256 digests of cryptographically random 256-bit bearer tokens, not plaintext
tokens or passwords. Tokens expire after eight hours using database UTC time.
The primary key supports validation, the user index supports revocation/FK access,
and the expiry index supports operator cleanup of expired rows. User deletion
cascades token removal. Token checks also require an active account.

V3's generated normalized-email key preserves existing email text. If trim/lowercase
collisions exist, migration fails without merging/deleting accounts. Review first:

```sql
SELECT LOWER(TRIM(email)), COUNT(*) FROM users
GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;
```

Back up, stop old writers and deploy desktop/chat server changes together. Old code
cannot verify upgraded BCrypt accounts and old chat clients cannot use token
handshakes. For an already Flyway-managed database:

```powershell
.\mvnw.cmd flyway:info
.\mvnw.cmd flyway:migrate
.\mvnw.cmd flyway:validate
```

For a legacy database without Flyway history, first follow the explicit baseline-1
adoption procedure in migrations/README.md. Do not baseline an empty database or
rerun an applied version manually. Flyway migrate applies all pending versions,
including the subsequent Phase 8 V4 if present.

## Verification and remaining limits

AuthenticationSecurityCheck passed on a disposable migrated database: BCrypt salts,
legacy upgrade/CAS, confirm-password, normalization/duplicates, injection input,
session model mutation, logout/ban/expiry revocation, admin denial, both socket
protocols, sender spoofing and recipient-only delivery. Phase 5/6 service and DAO
checks also passed with authenticated test identities. Standalone main checks run
explicitly; Maven only compiles them with its current test discovery configuration.

The desktop still connects directly to MySQL. Someone with the database credentials
or arbitrary code execution can bypass application services; this refactor is not
a trusted remote API. Socket transport still lacks TLS: bearer tokens and messages
must not cross an untrusted network without a protected transport. Rate limiting,
password reset and encrypted transport remain security work, not claimed fixes.
If revocation cannot reach an unavailable database, local logout still clears the
session; the remote token expires normally and needs revocation after recovery.

Legacy MessagingIntegrationCheck was updated for token handshakes but its unrelated
NULL-timestamp migration fixtures remain incompatible with the current schema;
AuthenticationSecurityCheck exercises the real socket security paths instead.
