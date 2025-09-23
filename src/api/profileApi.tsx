import axios from "axios";

const apiprofile =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api/users/:id"; // ✅ CRA dùng process.env

export interface UserProfile {
  user_ID: number;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export const apiProfile = async (id: string) => {
  const res = await axios.get<UserProfile>(`${apiprofile}/users/${id}`);
  return res.data;
};
