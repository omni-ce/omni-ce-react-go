import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import type { User } from "@/types/user";
import type { Rule } from "@/types/rule";

export const authService = {
  login: async (username: string, password: string) => {
    const response = await satellite.post<
      Response<{ token: string; user: User; rules: Rule[] }>
    >("/api/auth/login", {
      username,
      password,
    });
    return response.data;
  },
  validate: async () => {
    const response =
      await satellite.get<Response<{ user: User; rules: Rule[] }>>(
        "/api/auth/validate",
      );
    return response.data;
  },
  logout: async () => {
    const response =
      await satellite.delete<Response<unknown>>("/api/auth/logout");
    return response.data;
  },
  register: async (name: string, username: string, password: string) => {
    const response = await satellite.post<Response<unknown>>(
      "/api/auth/register",
      {
        name,
        username,
        password,
      },
    );
    return response.data;
  },
};
