import { Router } from "express";
import { z } from "zod";
import { hashPassword, requireAuth, signToken, verifyPassword } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const authRouter = Router();

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  age: true,
  gender: true,
  city: true,
  country: true,
  createdAt: true,
  updatedAt: true,
} as const;

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Ethiopia"),
});

const loginSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

authRouter.post(
  "/register",
  asyncRoute(async (req, res) => {
    const { password, ...data } = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      throw new HttpError(409, "Email is already registered");
    }

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash: await hashPassword(password),
      },
      select: publicUserSelect,
    });

    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ user, token });
  }),
);

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({ sub: user.id, email: user.email });
    const { passwordHash: _passwordHash, ...publicUser } = user;

    res.json({ user: publicUser, token });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const userId = req.authUser?.sub;
    if (!userId) throw new HttpError(401, "Missing auth token");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) throw new HttpError(404, "User not found");
    res.json({ user });
  }),
);
