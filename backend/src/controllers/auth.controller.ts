import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { name, username, preferredTimezone } = req.body;

  if (!name || !username || !preferredTimezone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(409).json({ message: "Username already taken" });
  }
  
  const newUser = await prisma.user.create({
    data: { name, username, preferredTimezone },
  });

  res.status(201).json({message:'Successfully registered', user: newUser });
};


export const login = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username)
    return res.status(400).json({ message: "Username is required" });

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return res.status(401).json({ message: "User not found" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user,
  });
};