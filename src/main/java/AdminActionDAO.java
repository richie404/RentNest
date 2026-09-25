import java.util.*;
public class AdminActionDAO {
    public boolean insert(int adminId,String type,int targetId,String details) {
        return JdbcDAO.update("INSERT INTO admin_actions(admin_id,action_type,target_id,details) VALUES (?,?,?,?)",adminId,type,targetId,details)>0;
    }
    public List<AdminAction> findRecent(int limit) { return JdbcDAO.query("SELECT * FROM admin_actions ORDER BY created_at DESC LIMIT ?",DaoMappers::action,limit); }
    public boolean deleteAll() { return JdbcDAO.update("DELETE FROM admin_actions")>0; }
}
