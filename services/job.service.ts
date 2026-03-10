import { api } from "@/lib/api";

export async function listJobs() {
  const res = await api.get("/jobs");
  return res.data;
}

export async function getJobById(id: string) {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
}

export async function createJob(data: {
  title: string;
  description: string;
  salary?: number;
  location: string;
  remote: boolean;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
}) {
  const res = await api.post("/jobs", data);
  return res.data;
}

export async function updateJob(
  id: string,
  data: {
    title?: string;
    description?: string;
    salary?: number;
    location?: string;
    remote?: boolean;
    type?: "FULL_TIME" | "PART_TIME" | "CONTRACT";
    status?: "OPEN" | "CLOSED" | "PAUSED";
  },
) {
  const res = await api.patch(`/jobs/${id}`, data);
  return res.data;
}

export async function deleteJob(id: string) {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
}
