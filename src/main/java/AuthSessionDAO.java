import java.util.Optional;
final class AuthSessionDAO {
    void insert(String hash, int userId) {
        JdbcDAO.update("INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR))",hash,userId);
    }
    Optional<User> findUser(String hash) {
        return JdbcDAO.one("SELECT u.* FROM users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.active=1 AND u.status='ACTIVE'",DaoMappers::user,hash);
    }
    void delete(String hash) { JdbcDAO.update("DELETE FROM auth_sessions WHERE token_hash=?",hash); }
    void deleteByUser(int id) { JdbcDAO.update("DELETE FROM auth_sessions WHERE user_id=?",id); }
}
