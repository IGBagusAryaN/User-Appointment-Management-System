import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/en";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("en");

const prisma = new PrismaClient();

function isWithinWorkingHours(date: Date, timezoneId: string): boolean {
  try {
    const localTime = dayjs(date).tz(timezoneId);
    const hour = localTime.hour();
    return hour >= 8 && hour < 17;
  } catch {
    return false;
  }
}

export const createAppointment = async (req: Request, res: Response) => {
  const { title, start, end, inviteeUsernames } = req.body;
  const creatorId = req.user?.id;

  if (!creatorId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) return res.status(404).json({ error: "Creator not found" });

    const startDate = dayjs.tz(start, creator.preferredTimezone);
    const endDate = dayjs.tz(end, creator.preferredTimezone);

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: "Invalid date format or timezone" });
    }

    if (!startDate.isSame(endDate, "day")) {
      return res.status(400).json({
        error: "Start and end time must be on the same date",
      });
    }

    if (endDate.isBefore(startDate)) {
      return res.status(400).json({
        error: "End time must be after start time",
      });
    }

    const invitees = await prisma.user.findMany({
      where: {
        username: { in: inviteeUsernames || [] },
      },
    });

    if ((inviteeUsernames?.length || 0) !== invitees.length) {
      return res.status(400).json({
        error: "One or more invitee usernames are invalid or not found",
      });
    }

    const allParticipantIds = Array.from(
      new Set([creatorId, ...invitees.map((u) => u.id)])
    );

    const participants = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
    });

    const violatingUsers = participants.filter((user) => {
      return (
        !isWithinWorkingHours(startDate.toDate(), user.preferredTimezone) ||
        !isWithinWorkingHours(endDate.toDate(), user.preferredTimezone)
      );
    });

    if (violatingUsers.length > 0) {
      return res.status(400).json({
        error: "The following users have times outside working hours (08:00–17:00):",
        users: violatingUsers.map(
          (u) => `${u.username} (${u.preferredTimezone})`
        ),
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        start: startDate.toDate(),
        end: endDate.toDate(),
        creator: { connect: { id: creatorId } },
      },
    });

    await prisma.appointmentParticipant.createMany({
      data: allParticipantIds.map((userId) => ({
        userId,
        appointmentId: appointment.id,
      })),
    });

    const fullAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        participants: { include: { user: true } },
      },
    });

    res.status(201).json({
      message: "Appointment successfully created",
      data: fullAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to create appointment",
      detail: err instanceof Error ? err.message : err,
    });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const appointments = await prisma.appointment.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { start: "asc" },
    });

    const formatted = appointments.map((app) => {
      const localStart = dayjs(app.start).tz(user.preferredTimezone);
      const localEnd = dayjs(app.end).tz(user.preferredTimezone);

      return {
        id: app.id,
        title: app.title,
        creator: app.creator,
        date: localStart.format("D MMMM YYYY"),
        timeRange: `${localStart.format("HH:mm")} - ${localEnd.format("HH:mm")}`,
        participants: app.participants.map((p) => p.user),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch appointments",
      detail: err instanceof Error ? err.message : err,
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { title, start, end, inviteeUsernames } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        participants: true,
        creator: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.creatorId !== userId) {
      return res.status(403).json({ error: "Forbidden: not the creator" });
    }

    const creator = await prisma.user.findUnique({ where: { id: userId } });
    if (!creator) return res.status(404).json({ error: "Creator not found" });

    const startDate = dayjs.tz(start, creator.preferredTimezone);
    const endDate = dayjs.tz(end, creator.preferredTimezone);

    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ error: "Invalid date format or timezone" });
    }

    if (!startDate.isSame(endDate, "day")) {
      return res.status(400).json({ error: "Start and end time must be on the same date" });
    }

    if (endDate.isBefore(startDate)) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const invitees = await prisma.user.findMany({
      where: { username: { in: inviteeUsernames || [] } },
    });

    if ((inviteeUsernames?.length || 0) !== invitees.length) {
      return res.status(400).json({ error: "Some invitees are invalid" });
    }

    const allParticipantIds = Array.from(new Set([userId, ...invitees.map((u) => u.id)]));
    const participants = await prisma.user.findMany({ where: { id: { in: allParticipantIds } } });

    const violatingUsers = participants.filter((user) => {
      return (
        !isWithinWorkingHours(startDate.toDate(), user.preferredTimezone) ||
        !isWithinWorkingHours(endDate.toDate(), user.preferredTimezone)
      );
    });

    if (violatingUsers.length > 0) {
      return res.status(400).json({
        error: "Some users have times outside working hours (08:00–17:00):",
        users: violatingUsers.map((u) => `${u.username} (${u.preferredTimezone})`),
      });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        title,
        start: startDate.toDate(),
        end: endDate.toDate(),
      },
    });

    await prisma.appointmentParticipant.deleteMany({
      where: { appointmentId },
    });

    await prisma.appointmentParticipant.createMany({
      data: allParticipantIds.map((userId) => ({
        userId,
        appointmentId,
      })),
    });

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        participants: { include: { user: true } },
      },
    });

    res.json({
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update appointment",
      detail: err instanceof Error ? err.message : err,
    });
  }
};


export const deleteAppointment = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.creatorId !== userId) {
      return res.status(403).json({ error: "Forbidden: not the creator" });
    }

    await prisma.appointmentParticipant.deleteMany({
      where: { appointmentId },
    });

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete appointment",
      detail: err instanceof Error ? err.message : err,
    });
  }
};