import crypto from "node:crypto";

export function generateToken(length = 10): string {
  return crypto.randomBytes(Math.ceil((length * 3) / 4)).toString("base64url").slice(0, length);
}

export function hashToken(token: string, pepper: string): string {
  return crypto.createHash("sha256").update(token + pepper).digest("hex");
}

export function randomId(): string {
  return crypto.randomUUID();
}


