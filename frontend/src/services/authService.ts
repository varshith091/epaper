import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post(
    `${API_URL}/register`,
    data
  );

  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(
    `${API_URL}/login`,
    data
  );

  return response.data;
};