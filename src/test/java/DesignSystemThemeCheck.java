import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Phase 11: RentNest Design System Theme Check")
class DesignSystemThemeCheck {

    @Test
    @DisplayName("Verify styles/rentnest-theme.css exists on classpath and defines complete token system")
    void testThemeStylesheetAvailabilityAndTokens() throws Exception {
        URL resource = getClass().getResource("/styles/rentnest-theme.css");
        assertNotNull(resource, "styles/rentnest-theme.css must be available on the classpath");

        String cssContent;
        try (InputStream in = resource.openStream()) {
            cssContent = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }

        assertFalse(cssContent.isBlank(), "rentnest-theme.css must not be empty");

        // Verify Brand Palette Tokens
        assertTrue(cssContent.contains("-fx-primary: #6D1737"), "Must define refined primary burgundy #6D1737");
        assertTrue(cssContent.contains("-fx-primary-dark"), "Must define primary dark token");
        assertTrue(cssContent.contains("-fx-primary-light"), "Must define primary light token");
        assertTrue(cssContent.contains("-fx-background"), "Must define background token");
        assertTrue(cssContent.contains("-fx-surface"), "Must define surface token");
        assertTrue(cssContent.contains("-fx-text-primary"), "Must define text-primary token");
        assertTrue(cssContent.contains("-fx-text-secondary"), "Must define text-secondary token");
        assertTrue(cssContent.contains("-fx-success"), "Must define success token");
        assertTrue(cssContent.contains("-fx-warning"), "Must define warning token");
        assertTrue(cssContent.contains("-fx-danger"), "Must define danger token");

        // Verify Typography hierarchy
        assertTrue(cssContent.contains(".text-display"), "Must define .text-display class");
        assertTrue(cssContent.contains(".text-h1"), "Must define .text-h1 class");
        assertTrue(cssContent.contains(".text-h2"), "Must define .text-h2 class");
        assertTrue(cssContent.contains(".text-h3"), "Must define .text-h3 class");
        assertTrue(cssContent.contains(".text-body"), "Must define .text-body class");
        assertTrue(cssContent.contains(".text-body-small"), "Must define .text-body-small class");
        assertTrue(cssContent.contains(".text-caption"), "Must define .text-caption class");

        // Verify Spacing utilities
        assertTrue(cssContent.contains(".gap-4"), "Must define .gap-4");
        assertTrue(cssContent.contains(".gap-8"), "Must define .gap-8");
        assertTrue(cssContent.contains(".gap-12"), "Must define .gap-12");
        assertTrue(cssContent.contains(".gap-16"), "Must define .gap-16");
        assertTrue(cssContent.contains(".gap-24"), "Must define .gap-24");
        assertTrue(cssContent.contains(".gap-32"), "Must define .gap-32");
        assertTrue(cssContent.contains(".gap-48"), "Must define .gap-48");

        // Verify Component classes
        assertTrue(cssContent.contains(".btn"), "Must define .btn");
        assertTrue(cssContent.contains(".btn-primary"), "Must define .btn-primary");
        assertTrue(cssContent.contains(".btn-secondary"), "Must define .btn-secondary");
        assertTrue(cssContent.contains(".btn-danger"), "Must define .btn-danger");
        assertTrue(cssContent.contains(".btn-ghost"), "Must define .btn-ghost");

        assertTrue(cssContent.contains(".card"), "Must define .card");
        assertTrue(cssContent.contains(".card-header"), "Must define .card-header");
        assertTrue(cssContent.contains(".card-body"), "Must define .card-body");
        assertTrue(cssContent.contains(".stat-card"), "Must define .stat-card");

        assertTrue(cssContent.contains(".form-control"), "Must define .form-control");
        assertTrue(cssContent.contains(".form-label"), "Must define .form-label");
        assertTrue(cssContent.contains(".form-error"), "Must define .form-error");
        assertTrue(cssContent.contains(".search-field"), "Must define .search-field");

        assertTrue(cssContent.contains(".table-view"), "Must define .table-view");

        assertTrue(cssContent.contains(".sidebar"), "Must define .sidebar");
        assertTrue(cssContent.contains(".sidebar-item"), "Must define .sidebar-item");
        assertTrue(cssContent.contains(".sidebar-item-active"), "Must define .sidebar-item-active");
        assertTrue(cssContent.contains(".top-nav"), "Must define .top-nav");

        assertTrue(cssContent.contains(".badge"), "Must define .badge");
        assertTrue(cssContent.contains(".badge-success"), "Must define .badge-success");
        assertTrue(cssContent.contains(".badge-warning"), "Must define .badge-warning");
        assertTrue(cssContent.contains(".badge-danger"), "Must define .badge-danger");
        assertTrue(cssContent.contains(".badge-neutral"), "Must define .badge-neutral");

        assertTrue(cssContent.contains(".empty-state"), "Must define .empty-state");
        assertTrue(cssContent.contains(".modal"), "Must define .modal");
    }
}
