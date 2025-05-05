import { useEffect, useState } from "react";
import { GetUserById } from "../../services/user-service/user-service";
import { useAuthStore } from "../../stores/auth-store";
import Cookies from "js-cookie";
import {
  createAppointment,
  getAppointment,
} from "../../services/appointment-service/appointment-service";
import { AppointmentCard } from "../../types/appointment.type";
import AppointmentTime from "./home-page-components/date-time";
import dayjs from "dayjs";
import { CreateAppointmentModal } from "./home-page-components/form-create-appt";
import { AppointmentCardView } from "./home-page-components/card-view";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ConfirmLogoutModal } from "./home-page-components/logout";

export const Home = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // 🆕 State modal logout
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    inviteeUsernames: [] as string[],
  });
  const [appointments, setAppointments] = useState<AppointmentCard[]>([]);
  const userId = user?.id;
  const token = Cookies.get("token");

  const loadAppointments = async () => {
    if (!userId || !token) return;
    try {
      const data = await getAppointment(token);
      setAppointments(data);
    } catch (err) {
      console.error("Gagal fetch appointment:", err);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !token) return;

    const start = `${form.date}T${form.startTime}`;
    const end = `${form.date}T${form.endTime}`;
    const now = dayjs();
    const startDate = dayjs(start);

    if (startDate.isBefore(now)) {
      toast.error("Select a start time that is after the current time.");
      return;
    }

    try {
      const data = {
        title: form.title,
        start,
        end,
        inviteeUsernames: form.inviteeUsernames,
      };

      const response = await createAppointment(data, token);
      toast.success(response.data.message);
      setIsModalOpen(false);
      await loadAppointments();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      const errorMessage =
        error.response?.data?.error || "Gagal membuat appointment";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !token) return;
      try {
        const data = await GetUserById(userId, token);
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [userId, token]);

  useEffect(() => {
    const handleUpdate = () => {
      loadAppointments();
    };

    window.addEventListener("appointment-updated", handleUpdate);
    return () => {
      window.removeEventListener("appointment-updated", handleUpdate);
    };
  }, []);

  const confirmLogout = () => {
    Cookies.remove("token");
    toast.success("You have been logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-6 pt-16">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Hi, {user?.name}</h1>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          onClick={() => setShowLogoutModal(true)} // 🆕 Tampilkan modal
        >
          Logout
        </button>
      </header>

      <div className="mb-4 flex justify-between">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary cursor-pointer"
        >
          + Create Appointment
        </button>
        <AppointmentTime timezone={user!.preferredTimezone} />
      </div>

      {isModalOpen && (
        <CreateAppointmentModal
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showLogoutModal && (
        <ConfirmLogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <div className="space-y-4 overflow-y-scroll max-h-[630px] p-2 ">
        {appointments.map((appt) => (
          <AppointmentCardView
            key={appt.id}
            appt={appt}
            onDeleted={loadAppointments}
          />
        ))}
      </div>
    </div>
  );
};
