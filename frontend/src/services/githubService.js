// frontend/src/services/githubService.js
import axios from "axios";

let API_BASE = `http://${window.location.hostname}:5000/api/github`;
API_BASE = `${(
  import.meta.env.VITE_API_URL ||
  "https://focusflow-backend-nuh9.onrender.com/api"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "")}/api/github`;

const githubClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

githubClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token");

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

githubClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong communicating with the GitHub service.";
    return Promise.reject(new Error(message));
  },
);

function normalizeConnectPayload(payload) {
  if (typeof payload === "string") {
    return { github_username: payload.trim() };
  }
  if (payload && typeof payload === "object") {
    return {
      ...payload,
      github_username: (
        payload.github_username ||
        payload.username ||
        ""
      ).trim(),
    };
  }
  return { github_username: "" };
}

export const githubService = {
  async getStatus() {
    const response = await githubClient.get("/status");
    return response.data;
  },

  async connectAccount(payload) {
    const body = normalizeConnectPayload(payload);
    const response = await githubClient.post("/connect", body);
    return response.data;
  },

  async disconnectAccount() {
    const response = await githubClient.delete("/disconnect");
    return response.data;
  },

  async getRepositories() {
    const response = await githubClient.get("/repositories");
    return response.data;
  },

  async getRepoCommits(owner, repo) {
    const response = await githubClient.get(
      `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
    );
    return response.data;
  },

  async getIssues() {
    const response = await githubClient.get("/issues");
    return response.data;
  },

  async getPullRequests() {
    const response = await githubClient.get("/pulls");
    return response.data;
  },
};

export default githubService;
