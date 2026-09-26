import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

/** Guarded integration checks: requires a fresh disposable schema migrated through V4. */
public class BookingWorkflowCheck {
    private static final LocalDate BASE = LocalDate.of(2099,1,1);
    private static int owner, renter, other, admin;
    private static final String PASSWORD = "fixture-password";
    public static void main(String[] args) throws Exception {
        try (Connection c=Database.getConnection()) { check("rentnest_phase8_test".equals(c.getCatalog()),"Disposable phase8 database required"); }
        try {
            AuthenticationService auth = new AuthenticationService();
            owner = auth.register("Owner","p8-owner@example.invalid",PASSWORD,PASSWORD,"OWNER");
            renter = auth.register("Renter","p8-renter@example.invalid",PASSWORD,PASSWORD,"RENTER");
            other = auth.register("Other","p8-other@example.invalid",PASSWORD,PASSWORD,"RENTER");
            admin = new UserDAO().insert("Admin","p8-admin@example.invalid",PasswordHasher.hash(PASSWORD),Role.ADMIN);
            BookingService service = service(renter);
            int listing=listing();
            check(service.request(listing,date(10),date(20)),"Initial booking");
            for(int[] period : new int[][]{{9,11},{19,21},{1,30},{12,15},{10,20}})
                check(!service.request(listing,date(period[0]),date(period[1])),"Overlap rejected "+Arrays.toString(period));
            check(service.request(listing,date(20),date(25)),"Exact departure/arrival boundary allowed");
            check(service.request(listing,date(5),date(10)),"Exact boundary before existing booking allowed");
            check(service.request(listing,date(26),date(28)),"Separated dates allowed");
            rejects(() -> service.request(listing,date(10),date(10)));
            rejects(() -> service.request(listing,date(20),date(10)));
            rejects(() -> service.request(listing,null,date(20)));
            for(BookingStatus status : BookingStatus.values()) {
                int l=listing();
                Booking existing=fixture(l,renter,date(10),date(20),status);
                new BookingDAO().insert(existing);
                check(service.request(l,date(10),date(20)) != status.blocksAvailability(),"Occupancy policy for "+status);
            }
            int concurrent=listing();
            try(ExecutorService executor=Executors.newFixedThreadPool(2)) {
                CountDownLatch ready=new CountDownLatch(2),go=new CountDownLatch(1);
                Future<Boolean> a=executor.submit(() -> attempt(concurrent,renter,ready,go));
                Future<Boolean> b=executor.submit(() -> attempt(concurrent,other,ready,go));
                check(ready.await(5,TimeUnit.SECONDS),"Both concurrent callers ready");go.countDown();
                check(a.get(20,TimeUnit.SECONDS)^b.get(20,TimeUnit.SECONDS),"Exactly one simultaneous attempt commits");
                check(new BookingDAO().findAll().stream().filter(x->x.getListingId()==concurrent).count()==1,"Only one row persisted");
            }
            Booking first=new BookingDAO().findByRenter(renter).stream().filter(b->b.getListingId()==listing).findFirst().orElseThrow();
            rejects(() -> service(other).cancelBooking(first.getId()));
            rejects(() -> service.updateStatus(first.getId(),BookingStatus.CONFIRMED));
            check(service(owner).updateStatus(first.getId(),BookingStatus.CONFIRMED),"Owner can approve own booking");
            rejects(() -> service(owner).updateStatus(first.getId(),BookingStatus.REJECTED));
            check(service(owner).cancelBooking(first.getId()),"Owner can cancel approved booking");
            rejects(() -> service(owner).updateStatus(first.getId(),BookingStatus.CONFIRMED));
            check(new BookingDAO().findById(first.getId()).isPresent(),"Cancellation retains history");
            int spoof=listing(); Booking submitted=fixture(spoof,other,date(1),date(2),BookingStatus.CONFIRMED);
            submitted.setTotalAmountValue(BigDecimal.ONE);submitted.setOwnerId(other);
            check(service.createBooking(submitted),"Valid request ignores forged identity/status/price fields");
            Booking stored=new BookingDAO().findByRenter(renter).stream().filter(b->b.getListingId()==spoof).findFirst().orElseThrow();
            check(stored.getOwnerId()==owner && stored.getBookingStatus()==BookingStatus.PENDING_OWNER_APPROVAL
                && stored.getTotalAmountValue().compareTo(new BigDecimal("100.00"))==0,"Server-derived fields");
            int own=new ListingDAO().insert(new Listing().setTitle("Own").setLocation("Fixture").setPricePerMonth(3100).setOwnerId(renter).setStatus("APPROVED"));
            rejects(() -> service.request(own,date(1),date(3)));
            int unavailable=listing(); Listing changed=new ListingDAO().findById(unavailable).orElseThrow().setAvailable(false);
            new ListingDAO().update(changed);rejects(() -> service.request(unavailable,date(1),date(3)));
            int pending=listing();new ListingDAO().updateStatus(pending,ApprovalStatus.PENDING);rejects(() -> service.request(pending,date(1),date(3)));
            // Approval must recheck current listing state, not the screen's cached row.
            new ListingDAO().updateStatus(spoof,ApprovalStatus.REJECTED);
            rejects(() -> service(owner).updateStatus(stored.getId(),BookingStatus.CONFIRMED));
            int historical=listing();
            new BookingDAO().insert(fixture(historical,renter,LocalDate.now().minusDays(10),LocalDate.now().minusDays(1),BookingStatus.CONFIRMED));
            Booking ended=new BookingDAO().findByRenter(renter).stream().filter(b->b.getListingId()==historical).findFirst().orElseThrow();
            check("COMPLETED".equals(ended.getLifecycle()),"Completion derived from confirmed dates");
            rejects(() -> service(owner).cancelBooking(ended.getId()));
            failsSql(() -> new ListingDAO().delete(historical));
            failsSql(() -> new UserDAO().delete(renter));
            failsSql(() -> new UserDAO().delete(owner));
            failsSql(() -> new BookingDAO().insert(fixture(historical,renter,date(1),date(1),BookingStatus.PENDING)));
            check(BookingService.calculateAmount(new BigDecimal("3100"),LocalDate.of(2099,1,31),LocalDate.of(2099,2,28)).compareTo(new BigDecimal("3100"))==0,"Month-end pricing");
            check(BookingService.calculateAmount(new BigDecimal("3100"),LocalDate.of(2099,1,31),LocalDate.of(2099,3,30)).compareTo(new BigDecimal("6200"))<0,"Proration cannot exceed following full-month charge");
            checkTables(ended);
            check(Database.dataSource().getHikariPoolMXBean().getActiveConnections()==0,"All leases returned");
            System.out.println("PASS: non-overlap, exact boundaries, all overlap shapes, status occupancy, concurrency, authorization, approval checks, derived price, retained history and actual FXML table bindings");
        } finally { SessionManager.logout();Database.close(); }
    }
    private static boolean attempt(int listing,int actor,CountDownLatch ready,CountDownLatch go) throws Exception {
        ready.countDown();go.await();return service(actor).request(listing,date(10),date(20));
    }
    private static int listing() { return new ListingDAO().insert(new Listing().setTitle("Booking fixture").setLocation("Fixture").setPricePerMonth(3100).setOwnerId(owner).setStatus("APPROVED")); }
    private static LocalDate date(int day) { return BASE.withDayOfMonth(day); }
    private static Booking fixture(int listing,int renter,LocalDate start,LocalDate end,BookingStatus status) { return new Booking(listing,renter,owner,start,end,3100,status.name()); }
    private static BookingService service(int id) { return new BookingService(new ServiceAccess(()->new UserDAO().findById(id).orElseThrow())); }
    private static void rejects(Runnable work) { try {work.run();}catch(IllegalArgumentException|SecurityException expected){return;}throw new AssertionError("Expected domain rejection"); }
    private static void failsSql(Runnable work) { try {work.run();}catch(DataAccessException expected){return;}throw new AssertionError("Expected history/date constraint"); }
    private static void check(boolean condition,String message){if(!condition)throw new AssertionError(message);}
    @SuppressWarnings("unchecked")
    private static void checkTables(Booking row) throws Exception {
        CountDownLatch done=new CountDownLatch(1);Throwable[] failure=new Throwable[1];
        javafx.application.Platform.startup(()->{
            try {
                for(String role:List.of("owner","renter","admin")) {
                    SessionManager.login("p8-"+role+"@example.invalid",PASSWORD,false).orElseThrow();
                    String file=switch(role){case "owner"->"OwnerBookings.fxml";case "renter"->"RenterBookings.fxml";default->"AdminBookingManagement.fxml";};
                    javafx.scene.Parent root=javafx.fxml.FXMLLoader.load(BookingWorkflowCheck.class.getResource("/"+file));
                    javafx.scene.control.TableView<Booking> table=(javafx.scene.control.TableView<Booking>)root.lookup("#bookingTable");
                    check(table!=null,"Booking table injection: "+file);
                    for(javafx.scene.control.TableColumn<Booking,?> column:table.getColumns()) {
                        Object actual=column.getCellObservableValue(row).getValue();
                        Object expected=switch(column.getId()) {
                            case "colId","colBookingId"->row.getId();case "colProperty"->row.getListingId();
                            case "colOwner"->row.getOwnerId();case "colRenter"->row.getRenterId();
                            case "colStart"->row.getStartDate();case "colEnd"->row.getEndDate();
                            case "colAmount"->row.getTotalAmount();case "colStatus"->row.getDisplayStatus();default->throw new AssertionError("Unknown column");};
                        check(Objects.equals(actual,expected),"Typed table binding "+file+"/"+column.getId());
                    }
                }
            }catch(Throwable e){failure[0]=e;}finally{done.countDown();}
        });
        check(done.await(30,TimeUnit.SECONDS),"Table checks completed");
        javafx.application.Platform.exit();
        if(failure[0]!=null)throw new AssertionError("Table binding failure",failure[0]);
    }
}
