import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "./http.js";

const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  exp: z.number(),
});

export type AuthUser = z.infer<typeof jwtPayloadSchema>;

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scrypt(password, salt);
  return `scrypt:${salt}:${key}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !key) return false;

  const candidate = await scrypt(password, salt);
  const candidateBuffer = Buffer.from(candidate, "hex");
  const storedBuffer = Buffer.from(key, "hex");

  return candidateBuffer.length === storedBuffer.length && crypto.timingSafeEqual(candidateBuffer, storedBuffer);
}

export function signToken(payload: Omit<AuthUser, "exp">, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = getJwtSecret();
  const body: AuthUser = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = sign(`${header}.${encodedPayload}`, secret);

  return `${header}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string) {
  const secret = getJwtSecret();
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new HttpError(401, "Invalid auth token");
  }

  const expectedSignature = sign(`${header}.${payload}`, secret);
  if (!safeEqual(signature, expectedSignature)) {
    throw new HttpError(401, "Invalid auth token");
  }

  const parsedPayload = jwtPayloadSchema.parse(JSON.parse(base64UrlDecode(payload)));
  if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Auth token expired");
  }

  return parsedPayload;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    return next(new HttpError(401, "Missing auth token"));
  }

  try {
    req.authUser = verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

function scrypt(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw new HttpError(500, "JWT_SECRET must be set to at least 24 characters");
  }

  return secret;
}
