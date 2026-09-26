# RentNest socket messaging

## Architecture

RentNest now has one socket implementation. `MessagingServer` owns connection
acceptance, authentication, routing, persistence acknowledgements and shutdown.
`Server` is the canonical launcher on port 5000. `ChatServer` is only a
compatibility launcher on port 5050 and delegates to the same engine. Likewise,
`Client` is the canonical reconnecting client and `ChatClient` is only an adapter
for the former pipe-delimited API.

The JavaFX controllers use `ChatConversation`:

```text
MessageController / ChatWindowController
                 |
          ChatConversation
          /              \
 Client (socket/retry)   MessageService -> MessageDAO -> MySQL
          |
    MessagingServer -> MessageService -> MessageDAO -> MySQL
```

`ChatController` is the separate, in-memory RentNest assistant screen. It is not
a second user-to-user socket implementation.

## Authentication and identity

The first modern client frame is `AUTH <opaque-session-token>`. The server
resolves the user from the server-side `auth_sessions` table and never accepts a
claimed user ID as authentication. The token is checked again while the
connection is active, so logout or revocation ends subsequent socket activity.
The sender ID written to a message is always the authenticated user ID.

The compatibility handshake is `REGISTER <opaque-session-token>`. Legacy message
frames still contain a sender field for wire compatibility, but the server rejects
the frame unless it matches the authenticated session.

The launcher binds to `127.0.0.1` by default because this protocol does not add
TLS. A different bind address must be an explicit deployment decision:

```powershell
java '-Drentnest.chat.bind=192.0.2.10' -cp <classpath> Server 5000
```

Do not expose that listener to an untrusted network without a protected transport
or network tunnel. Tokens are never written to application logs.

## Delivery and persistence

Modern sends carry a UUID request ID. Migration V5 adds nullable
`messages.client_message_id` and a unique key on
`(sender_id, client_message_id)`. Existing message rows remain valid because the
new column is nullable. A retry with the same authenticated sender and UUID reads
the original row instead of inserting a duplicate; reuse with changed content is
rejected.

The server persists a message before returning `ACK` or routing `EVENT`. Both
frames contain the same database message ID. The client uses the same UUID after
a lost connection and in the existing direct-database offline fallback. This
makes reconnect replay idempotent across both paths. The UI merges history and
live events by database message ID.

The schema change is applied in this order:

1. V1 creates the messages table.
2. V2 adds the conversation query indexes.
3. V3 and V4 apply authentication and booking changes.
4. V5 adds the retry identity and sender-scoped unique key.

Apply V5 through the normal Flyway command documented in the project README. Do
not manually add the column to an already Flyway-managed database.

## Concurrency, protocol limits and cleanup

- Connected peers and per-user routes use concurrent collections.
- The server accepts at most 128 simultaneous peers and each peer has a bounded
  128-frame output queue. Slow consumers are disconnected.
- Frames are strict UTF-8, newline-delimited and bounded to 16,384 characters.
  Message bodies are Base64 and limited to 8,192 UTF-8 bytes.
- Five malformed modern frames close a connection. Oversized or incomplete
  frames close it immediately.
- The client uses exponential reconnect delay from 1 to 30 seconds, heartbeat
  frames, a 128-message pending bound and a two-minute confirmation timeout.
- Explicit disconnect disables reconnect. Application shutdown closes the client,
  worker executor, database pool and authenticated session.
- `ChatConversation` loads history off the JavaFX Application Thread and sends all
  control updates through `Platform.runLater`. It unregisters listeners when its
  scene is detached or its window is hidden.
- The server closes listener sockets, peer sockets, streams and workers during
  graceful shutdown. Disconnected peers are removed from routing maps.

## Configuration and operation

The desktop client defaults to `127.0.0.1:5000`. These system properties override
the endpoint:

```text
rentnest.chat.host
rentnest.chat.port
```

Start the canonical server with the application database configuration already
used by RentNest:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp Server 5000
```

## Verification

`SocketMessagingCheck` is a real socket and database integration check. It covers:

- authentication, session revocation and claimed-sender impersonation;
- private routing, legacy adapter routing and outsider isolation;
- Unicode/multiline messages and malformed/oversized frames;
- persistence failure without a false acknowledgement;
- sequential, concurrent and lost-ACK retry deduplication;
- offline persistence followed by reconnect replay;
- JavaFX-thread rendering, history/event merging and listener disposal;
- graceful server shutdown, unfinished handshakes and database-lease cleanup.

It requires a disposable migrated database. It refuses to run unless the selected
catalog is exactly `rentnest_phase9_test`:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp SocketMessagingCheck
```

The check is main-based: Maven compiles it but does not discover it as a JUnit
test. Set `RENTNEST_DB_CONFIG` to the disposable database configuration before
running it.
