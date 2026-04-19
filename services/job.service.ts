import { api } from "@/lib/api";

export type JobQuestion = {
  id: string;
  prompt: string;
  type: "SHORT_TEXT" | "LONG_TEXT";
  required: boolean;
  order: number;
};

export type JobQuestionInput = {
  prompt: string;
  type: "SHORT_TEXT" | "LONG_TEXT";
  required: boolean;
};

type JobUpsertPayload = {
  title: string;
  description: string;
  salary?: number;
  location: string;
  remote: boolean;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  questions?: JobQuestionInput[];
};

export async function listJobs() {
  const res = await api.get("/jobs");
  return res.data;
}

export async function getCompanyJobs() {
  const res = await api.get("/company/profile");
  return res.data.jobs;
}

export async function getJobById(id: string) {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
}

export async function createJob(data: JobUpsertPayload) {
  const res = await api.post("/jobs", data);
  return res.data;
}

export async function updateJob(
  id: string,
  data: Partial<JobUpsertPayload> & {
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
