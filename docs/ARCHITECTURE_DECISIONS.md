# Architecture Decision Records (ADRs)

## ADR-001: MongoDB over PostgreSQL

**Status:** Accepted

**Context:** Placement data has variable schemas — student profiles differ by branch, companies have varying role structures, selection processes are custom per company.

**Decision:** Use MongoDB with Mongoose for flexible document storage.

**Consequences:**
- ✅ Schema flexibility for varying student/company profiles
- ✅ Native JSON — no ORM mapping overhead
- ✅ Easy horizontal scaling
- ⚠️ No ACID transactions across collections (mitigated by application-level validation)

---

## ADR-002: JWT with Refresh Tokens over Sessions

**Status:** Accepted

**Context:** Need stateless auth for K8s multi-replica deployment — sessions require shared state.

**Decision:** Short-lived (7d) JWT access tokens + long-lived (30d) refresh tokens. Refresh happens transparently in the Axios interceptor.

**Consequences:**
- ✅ Stateless — works across multiple backend replicas
- ✅ No Redis required for session store
- ✅ Auto-refresh keeps users logged in seamlessly
- ⚠️ Cannot instantly revoke tokens (mitigated by short expiry + isActive flag check on every request)

---

## ADR-003: Zustand over Redux for Frontend State

**Status:** Accepted

**Context:** Need client-side state management. Redux adds boilerplate; React Context re-renders on every change.

**Decision:** Zustand with `persist` middleware for auth state.

**Consequences:**
- ✅ Minimal boilerplate — 30 lines vs 150 for Redux
- ✅ Built-in persistence (localStorage)
- ✅ No Provider wrapping needed
- ✅ DevTools support available

---

## ADR-004: ArgoCD GitOps over kubectl apply in Jenkins

**Status:** Accepted

**Context:** Need reliable K8s deployments with drift detection and easy rollback.

**Decision:** Jenkins updates image tags in Git → ArgoCD watches Git → ArgoCD syncs to cluster.

**Consequences:**
- ✅ Git is single source of truth for cluster state
- ✅ Auto-heal drift — if someone manually changes a pod, ArgoCD reverts it
- ✅ Easy rollback — just revert the Git commit
- ✅ Visual deployment status in ArgoCD UI
- ⚠️ More complex than direct `kubectl apply` — justified for production

---

## ADR-005: Nginx as Frontend Container vs Node.js serve

**Status:** Accepted

**Context:** React produces a static build. Need to serve it efficiently.

**Decision:** Multi-stage Dockerfile — CRA builds to `/build`, Nginx serves the static files.

**Consequences:**
- ✅ Nginx is far more efficient than `node serve` for static files
- ✅ Gzip compression built in
- ✅ React Router supported via try_files
- ✅ Final image is ~23MB vs ~200MB with Node
- ✅ Can proxy `/api` requests to backend in the same container

---

## ADR-006: Prometheus + Grafana over Datadog/New Relic

**Status:** Accepted

**Context:** Need monitoring. Commercial APM tools (Datadog, New Relic) cost money at scale.

**Decision:** Self-hosted Prometheus for metrics + Grafana for dashboards.

**Consequences:**
- ✅ Free and open source
- ✅ Native Kubernetes integration via annotations
- ✅ Custom metrics via prom-client
- ✅ Grafana dashboards are portable/versioned
- ⚠️ Requires storage management for Prometheus TSDB

---

## ADR-007: Separate Frontend and Backend Deployments

**Status:** Accepted

**Context:** Could serve React from Express — simpler but couples scaling.

**Decision:** Frontend deployed to Vercel/Netlify CDN, backend deployed to EKS.

**Consequences:**
- ✅ Frontend served from CDN edge nodes — fast globally
- ✅ Frontend and backend scale independently
- ✅ Frontend auto-deploys on push via Vercel GitHub integration
- ✅ Backend can be scaled based on API load
- ⚠️ CORS must be configured (mitigated — already done)
