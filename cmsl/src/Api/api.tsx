import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/library/",
  withCredentials: true,
});

export default API;
