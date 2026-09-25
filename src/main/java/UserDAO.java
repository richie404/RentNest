import java.util.*;
public class UserDAO {
    private static final String SELECT="SELECT id,username,email,role,active,status,created_at FROM users ";
    public List<User> findAll() { return JdbcDAO.query(SELECT+"ORDER BY id DESC",DaoMappers::user); }
    public Optional<User> findByEmail(String email) { return JdbcDAO.one(SELECT+"WHERE LOWER(TRIM(email))=?",DaoMappers::user,email.trim().toLowerCase(Locale.ROOT)); }
    public Optional<User> findById(int id) { return JdbcDAO.one(SELECT+"WHERE id=?",DaoMappers::user,id); }
    public boolean existsByEmail(String email) { return JdbcDAO.one("SELECT id FROM users WHERE LOWER(TRIM(email))=?",r->r.getInt(1),email.trim().toLowerCase(Locale.ROOT)).isPresent(); }
    public Optional<UserCredentials> findCredentialsByEmail(String email) {
        List<UserCredentials> matches = JdbcDAO.query("SELECT * FROM users WHERE LOWER(TRIM(email))=?",r->new UserCredentials(DaoMappers.user(r),r.getString("password_hash")),email.trim().toLowerCase(Locale.ROOT));
        // Fail closed if an unmigrated database contains ambiguous normalized addresses.
        return matches.size() == 1 ? Optional.of(matches.getFirst()) : Optional.empty();
    }
    public boolean replacePasswordHash(int id, String expected, String replacement) {
        return JdbcDAO.update("UPDATE users SET password_hash=? WHERE id=? AND BINARY password_hash=BINARY ? AND active=1 AND status='ACTIVE'",replacement,id,expected)>0;
    }
    public int insert(String username, String email, String passwordHash, Role role) {
        return JdbcDAO.insert("INSERT INTO users (username,email,password_hash,role) VALUES (?,?,?,?)",username,email,passwordHash,role);
    }
    public boolean updateStatus(int id, UserStatus status) {
        return JdbcDAO.update("UPDATE users SET active=?,status=? WHERE id=?",status==UserStatus.ACTIVE,status,id)>0;
    }
    public boolean updateRole(int id, Role role) { return JdbcDAO.update("UPDATE users SET role=? WHERE id=?",role,id)>0; }
    public boolean delete(int id) { return JdbcDAO.update("DELETE FROM users WHERE id=?",id)>0; }
}
