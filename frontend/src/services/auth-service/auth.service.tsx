import axios, { AxiosResponse } from "axios";
import { LoginForm, RegisterForm } from "../../types/auth.type";
import { apiUrl } from "../../utils/baseUrl";

export const fetchRegister = async (data: RegisterForm) => {
  try {
    console.log(apiUrl);
    const res: AxiosResponse = await axios.post(
      apiUrl + "auth/register",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Something went wrong");
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};

export const fetchLogin = async (data: LoginForm) => {
  try {
    const res: AxiosResponse = await axios.post(apiUrl + "auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Something went wrong");
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};
