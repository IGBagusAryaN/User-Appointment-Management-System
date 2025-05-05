import { UserType } from "./auth.type";

export type AppointmentType = {
  title: string;
  start: string;
  end: string;
  inviteeUsernames: string[];
};

export type AppointmentDetailType = {
  id: string;
  title: string;
  start: string;
  end: string;
  creator: UserType;
  participants: UserType[];
};

export type AppointmentCard = {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  timezone: string;
  creator: UserType;
  participants: UserType[];
};
