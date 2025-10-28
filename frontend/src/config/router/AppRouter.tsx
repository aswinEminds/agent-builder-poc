import { SpinnerLoader } from "@/shared/components/ui";
import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// =============================================================================
// LAZY-LOADED COMPONENTS
// =============================================================================

const Home = React.lazy(() => import("@features/home/pages/Home"));
const WorkflowCanvas = React.lazy(
  () => import("@features/workflow/pages/WorkflowCanvas")
);

// =============================================================================
// Higher-order component that wraps lazy-loaded components with Suspense
// =============================================================================

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<SpinnerLoader size="lg" />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(Home),
  },
  {
    path: "/workflow/:id",
    element: withSuspense(WorkflowCanvas),
  },
]);

export default router;
