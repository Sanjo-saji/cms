import axios from "axios";

const API = axios.create({
  baseURL: "http://miserably-arriving-adder.ngrok-free.app/api",
  withCredentials: true,
});

export default API;
// http://10.0.2.2:3000/api
