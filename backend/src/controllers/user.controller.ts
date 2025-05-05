import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'get current user data SUCCESS',
      user: user,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        preferredTimezone: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          preferredTimezone: true,
        },
      });
  
      res.status(200).json({
        message: "get all users SUCCESS",
        users,
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
