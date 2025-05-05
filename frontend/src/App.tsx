import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Fallback from "./components/fallback/fallback";
import { PrivateLayout } from "./components/private-layout/private-layout";
import { Login } from "./components/pages/login-page";
import { Home } from "./components/pages/home-page";
import { Toaster } from "react-hot-toast";
import { Register } from "./components/pages/register-page";

function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <PrivateLayout />,
      children: [
        {
          path: "/",
          Component: Home,
          HydrateFallback: Fallback,
        },
      ],
    },
    {
      path: "/register",
      Component: Register,
      HydrateFallback: Fallback,
    },
    {
      path: "/login",
      Component: Login,
      HydrateFallback: Fallback,
    },
  ]);

  return (
    <div className="bg-neutral-50">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
