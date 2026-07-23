import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BrowsePage } from "./pages/BrowsePage";
import { PropertyDetailsPage } from "./pages/PropertyDetailsPage";
import { AddListingPage } from "./pages/AddListingPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import { RenterDashboardPage } from "./pages/RenterDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { BookingPage } from "./pages/BookingPage";
import { MessagesPage } from "./pages/MessagesPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "login", Component: LoginPage },
  { path: "register", Component: RegisterPage },
  { path: "browse", Component: BrowsePage },
  { path: "property/:id", Component: PropertyDetailsPage },
  { path: "add-listing", Component: AddListingPage },
  { path: "app/tenant/dashboard", Component: RenterDashboardPage },
  { path: "renter-dashboard", Component: RenterDashboardPage },
  { path: "app/owner/dashboard", Component: OwnerDashboardPage },
  { path: "owner-dashboard", Component: OwnerDashboardPage },
  { path: "app/admin/dashboard", Component: AdminDashboardPage },
  { path: "admin-dashboard", Component: AdminDashboardPage },
  { path: "booking/:id", Component: BookingPage },
  { path: "messages", Component: MessagesPage },
  { path: "favorites", Component: FavoritesPage },
  { path: "about", Component: AboutPage },
  { path: "*", Component: NotFoundPage },
]);
