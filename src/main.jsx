import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import router from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
