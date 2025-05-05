import axios, { AxiosResponse } from "axios";
import { AppointmentType } from "../../types/appointment.type";
import { apiUrl } from "../../utils/baseUrl";

export const createAppointment = async (
  data: AppointmentType,
  token: string
) => {
  try {
    const res: AxiosResponse = await axios.post(apiUrl + "appointment", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw error;
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};

export const updateAppointment = async (
  data: AppointmentType,
  appointmentId: string,
  token: string
) => {
  try {
    const res: AxiosResponse = await axios.put(
      apiUrl + `appointment/update/${appointmentId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw error;
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};

export const deleteAppointment = async (
  appointmentId: string,
  token: string
) => {
  try {
    const res: AxiosResponse = await axios.delete(
      apiUrl + `appointment/delete/${appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw error;
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};

export const getAppointment = async (token: string) => {
  try {
    const res: AxiosResponse = await axios.get(apiUrl + `appointment`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Something went wrong");
    }
    console.error("Unexpected Error:", error);
    throw error;
  }
};
