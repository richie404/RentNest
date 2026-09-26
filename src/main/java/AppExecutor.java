import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * ✅ A shared thread pool for background work in RentNest.
 * Use this to run DAO/database calls or long tasks without freezing the UI.
 */
public class AppExecutor {

    // Fixed-size thread pool (3 concurrent background threads)
    private static final ExecutorService executor = Executors.newFixedThreadPool(3);

    private AppExecutor() {
        // prevent instantiation
    }

    /** Get the shared executor instance */
    public static ExecutorService getExecutor() {
        return executor;
    }

    /** Optional: shutdown gracefully when app closes */
    public static void shutdown() {
        executor.shutdown();
        try { if (!executor.awaitTermination(3,java.util.concurrent.TimeUnit.SECONDS)) executor.shutdownNow(); }
        catch (InterruptedException interrupted) { executor.shutdownNow();Thread.currentThread().interrupt(); }
    }
}
