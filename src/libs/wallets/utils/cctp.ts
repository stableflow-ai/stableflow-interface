import { BASE_API_URL } from "@/config/api";
import axios from "axios";

export async function quoteSignature(data?: any) {
  const response = await axios.post(`${BASE_API_URL}/v1/cctp/sign`, data);
  if (response.status !== 200 || response.data.code !== 200) {
    throw new Error(response.data.message);
  }
  return response.data.data;
}
