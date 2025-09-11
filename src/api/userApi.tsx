import axios from "axios";
const apilogin = process.env.API_URL_LOGIN;
const apiregister = process.env.API_URL_REGISTER;


// BE chạy ở cổng 8080

export const apiLogin = async () => {
  const res = await axios.get(`${apilogin}/hello`);
  return res.data;
};

export const apiRegister = async () => {
  const res = await axios.get(`${apiregister}/hello`);
  return res.data;
};

