import type { Milestone } from "~/types/models";
import type { CreateMilestoneRequest } from "~/types/api";

export const useMilestones = () => {
  const { apiFetch } = useApi();

  const fetchMilestones = async (projectId: string) => {
    return await apiFetch<{ milestones: Milestone[]; summary: any }>(
      `/projects/${projectId}/milestones`
    );
  };

  const fetchMilestone = async (milestoneId: string) => {
    return await apiFetch<Milestone>(`/milestones/${milestoneId}`);
  };

  const createMilestone = async (
    projectId: string,
    data: CreateMilestoneRequest
  ) => {
    return await apiFetch<Milestone>(`/projects/${projectId}/milestones`, {
      method: "POST",
      body: data,
    });
  };

  const updateMilestone = async (
    milestoneId: string,
    data: Partial<CreateMilestoneRequest>
  ) => {
    return await apiFetch<Milestone>(`/milestones/${milestoneId}`, {
      method: "PUT",
      body: data,
    });
  };

  const deleteMilestone = async (milestoneId: string) => {
    return await apiFetch(`/milestones/${milestoneId}`, {
      method: "DELETE",
    });
  };

  return {
    fetchMilestones,
    fetchMilestone,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
};
