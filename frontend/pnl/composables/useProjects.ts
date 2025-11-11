import type { Project } from "~/types/models";
import type { CreateProjectRequest, UpdateProjectRequest } from "~/types/api";

export const useProjects = () => {
  const { apiFetch } = useApi();

  const fetchProjects = async () => {
    return await apiFetch<Project[]>("/projects");
  };

  const fetchProject = async (id: string) => {
    return await apiFetch<Project>(`/projects/${id}`);
  };

  const createProject = async (data: CreateProjectRequest) => {
    return await apiFetch<Project>("/projects", {
      method: "POST",
      body: data,
    });
  };

  const updateProject = async (id: string, data: UpdateProjectRequest) => {
    return await apiFetch<Project>(`/projects/${id}`, {
      method: "PUT",
      body: data,
    });
  };

  const deleteProject = async (id: string) => {
    return await apiFetch(`/projects/${id}`, {
      method: "DELETE",
    });
  };

  const addMember = async (projectId: string, email: string, role: string) => {
    return await apiFetch(`/projects/${projectId}/members`, {
      method: "POST",
      body: { email, role },
    });
  };

  const removeMember = async (projectId: string, memberId: string) => {
    return await apiFetch(`/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    });
  };

  const updateMemberRole = async (
    projectId: string,
    memberId: string,
    role: string
  ) => {
    return await apiFetch(`/projects/${projectId}/members/${memberId}`, {
      method: "PUT",
      body: { role },
    });
  };

  return {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    updateMemberRole,
  };
};
