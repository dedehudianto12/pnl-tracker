import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  throw new Error('JWT_SECRET and JWT_EXPIRES_IN must be defined in .env file');
}

console.log("🔐 JWT_SECRET and JWT_EXPIRES_IN are set in the environment variables");

// Explicit type assertions to satisfy TypeScript
const SECRET: Secret = JWT_SECRET as Secret;
const EXPIRES_IN: string | number = JWT_EXPIRES_IN as string;

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, SECRET, {
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, SECRET) as JWTPayload;
};
