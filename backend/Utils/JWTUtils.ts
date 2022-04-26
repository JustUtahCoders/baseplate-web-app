import jwt from "jsonwebtoken";

const { sign, verify } = jwt;

const secret = process.env.JWT_SECRET || "secret";

export function makeJWT(payload: object): string {
  const token = sign(payload, secret, { expiresIn: "1h" });

  return token;
}

export function verifyJWT(jwt: string): boolean {
  try {
    verify(jwt, secret);
    return true;
  } catch {
    return false;
  }
}
