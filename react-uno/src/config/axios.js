import axios from "axios";
import { addToast } from "../toasts";

let config = {
  baseURL: process.env.REACT_APP_HTTP_BACKEND_URL,
  timeout: 60 * 1000, // Timeout
  withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);


export const defaultCatch = (err) => {
  console.log(err.response)
  addToast({title:"Error",message: err.response?.data?.message || "Oh no! An uncaught error happened!"});
}

export const silent = () => {}

export default _axios;