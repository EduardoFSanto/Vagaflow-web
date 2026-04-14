import { api } from "@/lib/api";

export type ApplyPayload = {
  coverLetter?: string;
  yearsExperience?: number;
  salaryExpected?: number;
  startDate?: string;
  availability?: "IMMEDIATE" | "2_WEEKS" | "1_MONTH" | "NEGOTIABLE";
};

export async function applyToJob(jobId: string, data: ApplyPayload = {}) {
  const res = await api.post(`/applications/${jobId}`, data);
  return res.data;
}

export async function listMyApplications() {
  const res = await api.get("/applications");
  return res.data;
}

export async function listCompanyApplications() {
  const res = await api.get("/applications/company");
  return res.data;
}

export async function updateApplicationStatus(
  id: string,
  status: "PENDING" | "ACCEPTED" | "REJECTED",
) {
  const res = await api.patch(`/applications/${id}`, { status });
  return res.data;
}
