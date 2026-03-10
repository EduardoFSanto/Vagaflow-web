import { api } from "@/lib/api";

export async function applyToJob(jobId: string) {
  const res = await api.post(`/applications/${jobId}`);
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
