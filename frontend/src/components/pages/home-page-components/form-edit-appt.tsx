import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { components, MultiValueGenericProps, OptionProps } from "react-select";
import { UserType } from "../../../types/auth.type";
import { GetAllUser } from "../../../services/user-service/user-service";
import Cookies from "js-cookie";
import { getTimezoneLabelWithOffset } from "./timezone";
import { z } from "zod";
import { updateAppointment } from "../../../services/appointment-service/appointment-service";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date is invalid",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  inviteeUsernames: z
    .array(z.string())
    .min(1, "At least one participant required"),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

type OptionType = {
  label: string;
  value: string;
  name: string;
  username: string;
  preferredTimezone: string;
};

type Props = {
  isOpen: boolean;
  appointmentId: string;
  initialForm: AppointmentForm;
  onClose: () => void;
  onSuccess?: () => void;
};

export const EditAppointmentModal = ({
  isOpen,
  appointmentId,
  initialForm,
  onClose,
  onSuccess,
}: Props) => {
  const [cachedUsers, setCachedUsers] = useState<UserType[]>([]);
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AppointmentForm, string>>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
    }
  }, [isOpen, initialForm]);

  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    try {
      const token = Cookies.get("token");
      const data = await GetAllUser(token!);
      setCachedUsers(data.users);

      return data.users
        .filter((user: UserType) =>
          user.username.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((user: UserType) => ({
          label: `${user.name} (@${
            user.username
          }) - ${getTimezoneLabelWithOffset(user.preferredTimezone)}`,
          value: user.username,
          name: user.name,
          username: user.username,
          preferredTimezone: getTimezoneLabelWithOffset(user.preferredTimezone),
        }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (selected: readonly OptionType[] | null) => {
    const values = selected ? selected.map((s) => s.value) : [];
    setForm((prev) => ({ ...prev, inviteeUsernames: values }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = appointmentSchema.safeParse(form);
    if (!result.success) {
      const formatted = result.error.format();
      setFormErrors({
        title: formatted.title?._errors[0],
        date: formatted.date?._errors[0],
        startTime: formatted.startTime?._errors[0],
        endTime: formatted.endTime?._errors[0],
        inviteeUsernames: formatted.inviteeUsernames?._errors[0],
      });
      return;
    }

    try {
      setFormErrors({});
      setLoading(true);
      const token = Cookies.get("token");

      const appointmentData = {
        title: form.title,
        start: `${dayjs(form.date).format("YYYY-MM-DD")}T${form.startTime}`,
        end: `${dayjs(form.date).format("YYYY-MM-DD")}T${form.endTime}`,
        inviteeUsernames: form.inviteeUsernames,
      };
      console.log("Appointment data being sent:", appointmentData);

      const res = await updateAppointment(
        appointmentData,
        appointmentId,
        token!
      );
      toast.success(res?.data?.message);
      onSuccess?.();
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      const errorMessage =
        error.response?.data?.error || "Gagal membuat appointment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedOptions: OptionType[] = form.inviteeUsernames.map(
    (username) => {
      const user = cachedUsers.find((u) => u.username === username);
      return {
        label: user
          ? `${user.name} (@${user.username}) - ${getTimezoneLabelWithOffset(
              user.preferredTimezone
            )}`
          : username,
        value: username,
        name: user?.name || username,
        username,
        preferredTimezone: user?.preferredTimezone || "",
      };
    }
  );

  const CustomOption = (props: OptionProps<OptionType>) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">{data.name}</div>
            <div className="text-sm text-gray-500">@{data.username}</div>
          </div>
          <span className="text-sm text-gray-500">
            ({data.preferredTimezone})
          </span>
        </div>
      </components.Option>
    );
  };

  const CustomMultiValueLabel = (props: MultiValueGenericProps<OptionType>) => (
    <components.MultiValueLabel {...props}>
      <span>{props.data.name}</span>
    </components.MultiValueLabel>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-3 py-2 rounded outline-blue-500"
            />
            {formErrors.title && (
              <p className="text-sm text-red-500">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="date">Date</label>
            <input
              name="date"
              type="date"
              value={formatDateForInput(form.date)}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-3 py-2 rounded outline-blue-500"
            />
            {formErrors.date && (
              <p className="text-sm text-red-500">{formErrors.date}</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="w-full">
              <label htmlFor="startTime">Start</label>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded outline-blue-500"
              />
              {formErrors.startTime && (
                <p className="text-sm text-red-500">{formErrors.startTime}</p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="endTime">End</label>
              <input
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-3 py-2 rounded outline-blue-500"
              />
              {formErrors.endTime && (
                <p className="text-sm text-red-500">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="inviteeUsernames">Participants</label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              onChange={handleSelectChange}
              value={selectedOptions}
              placeholder="Invite participants..."
              className="react-select-container"
              classNamePrefix="select"
              components={{
                Option: CustomOption,
                MultiValueLabel: CustomMultiValueLabel,
              }}
            />
            {formErrors.inviteeUsernames && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.inviteeUsernames}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
