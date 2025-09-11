import axios from "axios";

export interface UserProfile {
  user_ID: number;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export const getUserById = async (id: string): Promise<UserProfile> => {
  const res = await axios.get<UserProfile>(
    `http://localhost:8080/api/users/${id}`
  );
  return res.data;
};
