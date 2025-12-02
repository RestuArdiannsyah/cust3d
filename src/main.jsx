import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import router from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
