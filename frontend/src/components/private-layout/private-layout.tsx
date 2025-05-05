import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import toast from "react-hot-toast";
import { Layout } from "../layout/layout";
import { Navigate } from "react-router";
import { useAuthStore } from "../../stores/auth-store";
import { GetCurrentUser } from "../../services/user-service/user-service";

export const PrivateLayout = () => {
  const { setUser } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  function retrieveCurrentUser() {
    const token = Cookies.get("token");
    console.log("Token saat retrieve user:", token);

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    GetCurrentUser(token)
      .then((res) => {
        console.log("User berhasil didapat:", res);
        setUser(res.user);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.error("Gagal get user:", err);
        toast.error("Please Login to continue!");
        setIsAuthenticated(false);
      });
  }

  useEffect(() => {
    retrieveCurrentUser();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center w-full items-center h-[100vh]">
        {/* <Loading size="10%"/> */}
        <div>Loadingg...</div>
      </div>
    );
  }

  return isAuthenticated ? <Layout /> : <Navigate to={"/login"} />;
};
