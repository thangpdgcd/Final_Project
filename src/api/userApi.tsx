import axios from "axios";

const API_URL = "http://localhost:8080/api/login"; // BE chạy ở cổng 8080

export const getHello = async () => {
  const res = await axios.get(`${API_URL}/hello`);
  return res.data;
};
