import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { fetchLogin } from "../../services/auth-service/auth.service";
import { useAuthStore } from "../../stores/auth-store";

const loginSchema = z.object({
  username: z.string().min(4, "Invalid email address"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    setIsLoading(true);

    toast
      .promise(
        fetchLogin(data).then((res) => {
          if (res.status === 200) {
            const data = res.data;
            console.log("data", data);
            setUser(data.user);
            Cookies.set("token", data.token);
            console.log("text", data.user);
            const responseData = res.data;
            navigate("/");
            return responseData.message;
          }
        }),
        {
          loading: "Sedang Login...",
          success: (message) => <div>{message}</div>,
          error: (error) => {
            return error.message;
          },
        },
        {
          success: {
            style: {
              background: "#ffffff",
              color: "#1d1d1d",
            },
          },
          error: {
            style: {
              background: "#ffffff",
              color: "#1d1d1d",
            },
          },
        }
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100vh]">
      <div className="text-2xl font-semibold">Login</div>
      <form className="mt-10 w-[20%]" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            id="floating_email"
            className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-secondary peer"
            placeholder=" "
            {...register("username")}
          />
          {errors.username && (
            <div className="text-red-400 text-sm mt-2">
              {errors.username.message}
            </div>
          )}
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-8 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8.5 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M17.834 6.166a8.25 8.25 0 1 0 0 11.668.75.75 0 0 1 1.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0 1 21.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 1 1-.82-6.26V8.25a.75.75 0 0 1 1.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 0 0-2.416-5.834ZM15.75 12a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z"
                clipRule="evenodd"
              />
            </svg>
            Username
          </label>
        </div>
        <div className="w-full my-4">
          <button
            className="border border-gray-200 bg-primary hover:bg-secondary w-full p-3 text-white font-bold rounded-lg cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            Login
          </button>
        </div>
        <div className="flex">
          Don't have an account yet?{" "}
          <Link to={"/register"} className="text-secondary ml-1">
            Register
          </Link>{" "}
        </div>
      </form>
    </div>
  );
};
