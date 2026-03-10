import { api } from "@/lib/api";

export async function getCompanyProfile() {
  const res = await api.get("/company/profile");
  return res.data;
}

export async function getCandidateProfile() {
  const res = await api.get("/candidate/profile");
  return res.data;
}

export async function updateCandidateProfile(data: {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  resumeUrl?: string;
}) {
  const res = await api.patch("/candidate/profile", data);
  return res.data;
}

export async function updateCompanyProfile(data: {
  name?: string;
  description?: string;
  cnpj?: string;
  website?: string;
  logo?: string;
  phone?: string;
  address?: string;
}) {
  const res = await api.patch("/company/profile", data);
  return res.data;
}

export async function deleteProfile(role: "CANDIDATE" | "COMPANY") {
  const route = role === "COMPANY" ? "/company/profile" : "/candidate/profile";
  const res = await api.delete(route);
  return res.data;
}
