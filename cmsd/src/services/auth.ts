import api from "../lib/api";

interface LoginPayload {
  employeeId: string;
  password: string;
}

export const login = async (data: LoginPayload) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};
