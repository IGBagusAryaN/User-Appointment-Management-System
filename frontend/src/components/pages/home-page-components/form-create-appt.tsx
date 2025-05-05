import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { components, MultiValueGenericProps, OptionProps } from "react-select";
import { UserType } from "../../../types/auth.type";
import { GetAllUser } from "../../../services/user-service/user-service";
import Cookies from "js-cookie";
import { getTimezoneLabelWithOffset } from "./timezone";
import { z } from "zod";

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

type Props = {
  form: AppointmentForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

type OptionType = {
  label: string;
  value: string;
  name: string;
  username: string;
  preferredTimezone: string;
};

export const CreateAppointmentModal = ({
  form,
  onChange,
  onSubmit,
  onClose,
}: Props) => {
  const [cachedUsers, setCachedUsers] = useState<UserType[]>([]);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AppointmentForm, string>>
  >({});

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
          preferredTimezone: `${getTimezoneLabelWithOffset(
            user.preferredTimezone
          )}`,
        }));
    } catch (error) {
      console.error("Gagal fetch user saat search:", error);
      return [];
    }
  };

  const handleSelectChange = (selected: readonly OptionType[] | null) => {
    const values = selected ? selected.map((s) => s.value) : [];
    const syntheticEvent = {
      target: {
        name: "inviteeUsernames",
        value: values,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    setFormErrors({});
    onSubmit(e);
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

  const CustomMultiValueLabel = (props: MultiValueGenericProps<OptionType>) => {
    return (
      <components.MultiValueLabel {...props}>
        <span>{props.data.name}</span>
      </components.MultiValueLabel>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="title">Title</label>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={onChange}
              className="w-full border border-gray-400 px-3 py-2 rounded outline-blue-500"
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
              value={form.date}
              onChange={onChange}
              className="w-full border border-gray-400 px-3 py-2 rounded outline-blue-500"
            />
            {formErrors.date && (
              <p className="text-sm text-red-500">{formErrors.date}</p>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label htmlFor="startTime">Start</label>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={onChange}
                className="w-full border border-gray-400 px-3 py-2 rounded outline-blue-500"
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
                onChange={onChange}
                className="w-full border border-gray-400 px-3 py-2 rounded outline-blue-500"
              />
              {formErrors.endTime && (
                <p className="text-sm text-red-500">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="inviteeUsernames">Participant</label>
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

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary cursor-pointer"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};
