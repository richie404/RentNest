# RentNest window and layout changes

This change is limited to window geometry and JavaFX layout. Colors, typography, controls, navigation destinations, authentication, database access, and business logic are preserved. Existing FXML filenames, controller names, `fx:id` values, and action handlers are unchanged.

## Phase 1 audit and verification

The Phase 1 request was checked against the current project before editing. The earlier responsive-layout implementation was already present, and the working tree was clean. All application Stage/Scene creation sites, window setters, all 21 FXML roots, significant child constraints, and CSS dimension rules were inspected. No additional production-code changes were necessary: the missing maximize/navigation/restore verification now passes on native Windows windows.

Files changed in this pass:

- **Created:** `src/test/java/NativeWindowCheck.java`, a standalone regression check that waits for native window events between actions. It checks initial sizing/centering, navigation across 12 pages in both normal and maximized states, restoration of the previous geometry, resizing after restore, and chat/booking windows with normal and maximized owners.
- **Modified:** `WINDOW_LAYOUT_REPORT.md`, with this audit, current verification results, test command, and the Phase 1 checklist.

No application Java files, FXML, CSS, packages, controller names, identifiers, handlers, business logic, or database code were changed in this pass. The following implementation sections describe the existing code verified by this audit.

## Window policy

- `Main.java` replaces fixed 950 × 700 dimensions and disabled resizing with `WindowManager.configureMain(stage)`.
- `WindowManager.java` uses `Screen.getPrimary().getVisualBounds()` and the owner's monitor for secondary windows. Dimensions are JavaFX logical pixels and exclude taskbars/panels.
- Main windows start at 88% of visual width/height. Initial dimensions are capped at 2400 × 1400. Minimum dimensions are 900 × 560, reduced when the usable screen is smaller.
- Secondary windows use 72% of their owner's width/height, with minimum 640 × 460 and initial caps of 1400 × 1000. All dimensions are clamped to the usable screen. The minimum can raise the percentage on smaller screens.
- Secondary windows use `initOwner`, open centered over their owner, and are clamped to screen bounds after native decorations are known.
- Windows remain resizable. Monitor-dependent limits update when moving the window. Initial-size caps do not restrict normal maximization; the maximum is the current monitor's visual bounds. Fullscreen is not enabled.
- `Router.java` retains the existing Scene and replaces its root. It no longer recenters on navigation. User-selected dimensions and position remain stable. The existing fade transition and destinations remain unchanged.
- All four secondary-stage launch sites were updated: booking and chat in `PropertyDetailsController.java`, plus chat in `OwnerDashboardController.java` and `RenterDashboardController.java`.

## Layout changes

Root `prefWidth` / `prefHeight` pairs were removed from these ten files:

`login.fxml`, `ChatWindow.fxml`, `Message.fxml`, `chat.fxml`, `BookProperty.fxml`, `PropertyDetails.fxml`, `RenterDashboard.fxml`, `OwnerDashboard.fxml`, `AdminDashboard.fxml`, `AdminBookingManagement.fxml`.

Login now has a centered card with preferred/maximum width 420. Register uses 460. Both cards retain their content's preferred height and sit in a transparent scrolling viewport: short windows scroll instead of squeezing or clipping fields. Inputs fill the card, and cards retain the existing styling.

Tables and dashboard lists grow vertically. `ui/ResponsiveTableView.java` fills wider table areas using JavaFX's constrained resize policy; when readable column minima cannot fit, it uses horizontal scrolling. Existing preferred column widths are retained as readable minima. Management action rows wrap at narrow widths.

The add-listing form and admin sidebar can scroll vertically. Booking/property-detail pages retain their existing scroll areas. Property images preserve aspect ratio and fit a container capped at 400 wide. Descriptions are capped at 900 for readable lines. About text and booking summaries wrap to available width.

Homepage and browse property grids now use JavaFX `TilePane`, wrapping the same cards according to available width. Rendering changes in their controllers are limited to layout and text wrapping; queries, filters, click handlers, and image loading are unchanged. Homepage action/content rows adapt to narrower areas. Long message bubbles can shrink and wrap instead of imposing their full preferred width.

### Intentionally retained dimensions

- 420/460 authentication cards, 300 property cards, and 280 explanatory cards keep content balanced on large displays.
- Existing 600-wide form caps, the 260-wide browse sidebar, and compact button/field dimensions serve local layout purposes.
- The shared top bar's preferred height of 55 is a component height, not a window size. Its user label is capped at 240 to accommodate long account names.
- Property image height 250 and existing thumbnail bounds preserve image proportions; no image-loading code changed.
- Table column widths preserve readable dates, amounts, IDs, and actions; scrolling handles narrow viewports.

## Files from the earlier responsive-layout implementation

New files:

- `src/main/java/WindowManager.java`
- `src/main/java/ui/ResponsiveTableView.java`
- `src/test/java/ResponsiveLayoutCheck.java`
- `WINDOW_LAYOUT_REPORT.md`

Modified Java files:

- `src/main/java/Main.java`
- `src/main/java/Router.java`
- `src/main/java/PropertyDetailsController.java`
- `src/main/java/OwnerDashboardController.java`
- `src/main/java/RenterDashboardController.java`
- `src/main/java/HomepageController.java`
- `src/main/java/BrowseController.java`
- `src/main/java/MessageController.java`

Modified resources (under `src/main/resources/`):

- `login.fxml`, `login.css`, `register.fxml`, `register.css`
- `homepage.fxml`, `browse.fxml`, `about.fxml`, `TopBar.fxml`
- `AddListing.fxml`, `listings.fxml`, `BookProperty.fxml`, `PropertyDetails.fxml`
- `AdminDashboard.fxml`, `AdminBookingManagement.fxml`, `AdminListingManagement.fxml`, `AdminUserManagement.fxml`
- `OwnerDashboard.fxml`, `OwnerBookings.fxml`, `RenterDashboard.fxml`, `RenterBookings.fxml`
- `ChatWindow.fxml`, `Message.fxml`, `chat.fxml`

## Verification

Clean compilation succeeded with Java 25. All 21 FXML layouts passed isolated loading/layout checks for 1366 × 768, 1600 × 900, 1920 × 1080, 2560 × 1440, and 800 × 600. The checks model a 48-pixel taskbar and window decorations, then apply the proportional sizing policy. These are logical viewport simulations, not five separate physical monitors.

The standalone layout check verifies authentication-card width/centering, form control bounds, table growth, narrow embedded admin tables, property-card wrapping, main and secondary window bounds, ownership, and stable Scene/Stage geometry across navigation. Eight screens also load with their actual controllers. Homepage and browse use their actual field injection, handlers, and card renderers with initial database reads disabled in test subclasses and sample listings kept in memory. The clean build and all these checks were rerun successfully for Phase 1.

`NativeWindowCheck` also passed on the current Windows display. Unlike the synchronous layout checks, it allows native window events and JavaFX layout pulses to settle before each geometry assertion. All 12 pages preserved the same Scene, dimensions, position, and maximized state. Maximize filled the usable display, restore returned to the recorded normal geometry within two logical pixels, and resizing after restore succeeded. Chat and booking windows were centered and bounded with both normal and maximized owners. Windows' invisible maximized frame borders can extend beyond visual bounds; initial and secondary window containment are checked separately from maximized content fill.

The UI checks use software rendering after a native graphics crash during the initial test run. This affects only the test command; application rendering settings were not changed. Existing CSS gradient/color warnings remain outside this targeted layout change. No FXMLLoader errors remain in the checks.

Manual previews were inspected for login, register, homepage, and browse during the earlier implementation. The updated application was launched with its normal renderer then, and its RentNest window was confirmed open and responding. The Phase 1 native-window checks use software rendering, but exercise actual Windows maximize and restore events. Physical multi-monitor transitions and authenticated database workflows were not exhaustively tested.

To repeat the checks from PowerShell:

```powershell
.\mvnw.cmd clean compile test-compile dependency:build-classpath '-Dmdep.outputFile=target/layout-classpath.txt'
$layoutClasspath = 'target/classes;target/test-classes;' + (Get-Content target/layout-classpath.txt -Raw)
& "$env:JAVA_HOME/bin/java.exe" '-Dprism.order=sw' --enable-native-access=ALL-UNNAMED -cp $layoutClasspath ResponsiveLayoutCheck
& "$env:JAVA_HOME/bin/java.exe" '-Dprism.order=sw' --enable-native-access=ALL-UNNAMED -cp $layoutClasspath NativeWindowCheck
```

Run the layout check first: it writes previews and controller-free fixtures under `target/layout-check/`, which the native check reuses. Neither test accesses or modifies the database. The native check closes only its own temporary windows. If Maven clean fails on OneDrive's read-only generated directories, clear the read-only attributes only under `target` before rerunning.

Current run logs: `target/phase1-build.log`, `target/phase1-layout.log`, and `target/phase1-native.log`. The clean build compiled 56 application source files and 3 test source files successfully. No Java compilation or FXMLLoader errors were found. Existing CSS warnings remain unchanged.

## Phase 1 requested checklist

- [x] Primary Stage is resizable.
- [x] Primary Stage adapts to screen resolution using visual bounds.
- [x] Primary Stage stays consistent during normal and maximized navigation.
- [x] Application does not initially cover the taskbar; native initial bounds check passes.
- [x] Login form stays compact and centered.
- [x] Register form stays usable, with scrolling in short viewports.
- [x] Tables expand appropriately and preserve readable column widths.
- [x] Dashboards use available space.
- [x] Secondary windows remain inside screen bounds when opened, with either owner state.
- [x] 1366 × 768 works in the layout simulation.
- [x] 1920 × 1080 works in the layout simulation.
- [x] Maximizing works in the native Windows test.
- [x] Restoring works and recovers the previous normal geometry in the native Windows test.
- [x] Business logic was untouched.
- [x] Database code was untouched.
