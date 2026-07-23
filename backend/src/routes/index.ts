import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import rbacRoutes from "../modules/rbac/rbac.routes";
import propertyRoutes from "../modules/properties/property.routes";
import discoveryRoutes from "../modules/discovery/discovery.routes";
import leaseRoutes from "../modules/leases/lease.routes";
import financialRoutes from "../modules/financial/financial.routes";
import maintenanceRoutes from "../modules/maintenance/maintenance.routes";
import communicationRoutes from "../modules/communication/communication.routes";
import analyticsRoutes from "../modules/analytics/analytics.routes";
import intelligenceRoutes from "../modules/intelligence/intelligence.routes";
import adminRoutes from "../modules/admin/admin.routes";

const apiV1Router = Router();

// Infrastructure Health Endpoint
apiV1Router.use("/health", healthRoutes);

// Sprint 1: Authentication Module
apiV1Router.use("/auth", authRoutes);

// Sprint 2: Users & Profiles Module
apiV1Router.use("/users", userRoutes);

// Sprint 2: Roles & Permissions Module
apiV1Router.use("/rbac", rbacRoutes);

// Sprint 3: Property & Unit Module
apiV1Router.use("/properties", propertyRoutes);

// Sprint 4: Discovery, Search & Engagement Module
apiV1Router.use("/discovery", discoveryRoutes);

// Sprint 5: Booking & Lease Lifecycle Module
apiV1Router.use("/leases", leaseRoutes);

// Sprint 6: Financial Management & Payment Engine
apiV1Router.use("/financial", financialRoutes);

// Sprint 7: Maintenance & Vendor Operations
apiV1Router.use("/maintenance", maintenanceRoutes);

// Sprint 8: Enterprise Messaging + Notification Engine
apiV1Router.use("/communication", communicationRoutes);

// Sprint 9: Analytics Engine & Executive Reporting
apiV1Router.use("/analytics", analyticsRoutes);

// Sprint 10: AI-Ready Intelligence Layer
apiV1Router.use("/intelligence", intelligenceRoutes);

// Sprint 11: Enterprise Administration Platform
apiV1Router.use("/admin", adminRoutes);

export default apiV1Router;
