import { auth } from "./auth";
import { signJwt, verifyJwt, type KodedockJwtPayload } from "./JWT/jwt.service";
import { validatePasswordStrength } from "./passwords/password.service";
import type { UserRole, User } from "@kodedock/types";

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
  jwt: string;
}

/**
 * High-Level Kodedock Auth Service
 * Bridges Better Auth with custom security, password validation, and JWT issuing.
 * Fully visible and modifiable by developers.
 */
export class KodedockAuthService {
  /**
   * Registers a new user with custom password validation & role assignment
   */
  static async registerUser(input: RegisterUserInput): Promise<AuthResult> {
    // 1. Enforce password complexity
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const assignedRole: UserRole = input.role || "BUYER";

    // 2. Register via Better Auth engine
    const response = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    });

    if (!response || !response.user) {
      throw new Error("User registration failed.");
    }

    // 3. Set custom role if different from default
    if (assignedRole !== "BUYER") {
      const ctx = await auth.$context;
      await ctx.internalAdapter.updateUser(response.user.id, {
        role: assignedRole,
      });
    }

    const user: User = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      emailVerified: response.user.emailVerified,
      image: response.user.image,
      role: assignedRole,
      createdAt: new Date(response.user.createdAt),
      updatedAt: new Date(response.user.updatedAt),
    };

    // 4. Generate custom cryptographic JWT token
    const jwt = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user,
      token: response.token || "",
      jwt,
    };
  }

  /**
   * Signs in an existing user and returns session + custom JWT
   */
  static async loginUser(input: LoginUserInput): Promise<AuthResult> {
    const response = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
      },
    });

    if (!response || !response.user || !response.token) {
      throw new Error("Invalid email or password.");
    }

    const userRole = ((response.user as any).role || "BUYER") as UserRole;

    const user: User = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      emailVerified: response.user.emailVerified,
      image: response.user.image,
      role: userRole,
      createdAt: new Date(response.user.createdAt),
      updatedAt: new Date(response.user.updatedAt),
    };

    const jwt = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user,
      token: response.token,
      jwt,
    };
  }

  /**
   * Verifies an Authorization header containing either a Better Auth Session Token or a custom JWT
   */
  static async verifyAuthorization(authHeader?: string): Promise<KodedockJwtPayload | null> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7).trim();

    // First attempt: Verify as custom JWT
    const jwtResult = verifyJwt(token);
    if (jwtResult.isValid && jwtResult.payload) {
      return jwtResult.payload;
    }

    // Second attempt: Verify as Better Auth session token
    try {
      const session = await auth.api.getSession({
        headers: new Headers({
          authorization: `Bearer ${token}`,
        }),
      });

      if (session && session.user) {
        return {
          sub: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: ((session.user as any).role || "BUYER") as UserRole,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Updates a user's role (e.g. promoting a user to SELLER or ADMIN)
   */
  static async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const ctx = await auth.$context;
    await ctx.internalAdapter.updateUser(userId, {
      role: newRole,
    });
  }
}
