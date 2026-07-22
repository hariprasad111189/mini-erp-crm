import jwt from "jsonwebtoken";

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return value ?? "dev-secret-change-me";
};

const expiresIn = (): jwt.SignOptions["expiresIn"] => {
  const value = process.env.JWT_EXPIRES_IN?.trim();
  // Accept ms-style durations ("8h") or integer seconds; fall back if misconfigured.
  if (value && (/^\d+$/.test(value) || /^\d+[smhd]$/i.test(value))) {
    return (/^\d+$/.test(value) ? Number(value) : value) as jwt.SignOptions["expiresIn"];
  }
  return "8h";
};

export const signToken = (payload: object) =>
  jwt.sign(payload, secret(), {
    expiresIn: expiresIn()
  });

export const verifyToken = <T>(token: string) => jwt.verify(token, secret()) as T;
