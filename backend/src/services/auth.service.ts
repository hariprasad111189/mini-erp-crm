import bcrypt from "bcrypt";
import { UnauthorizedError } from "../errors/app-error";
import { userRepository } from "../repositories/user.repository";
import { signToken } from "../utils/jwt";

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError("Invalid email or password");

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}

export const authService = new AuthService();

