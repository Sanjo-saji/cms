import axios from "axios";

const API = axios.create({
  baseURL: "https://miserably-arriving-adder.ngrok-free.app/api",
  withCredentials: true,
});

export default API;
