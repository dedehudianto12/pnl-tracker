import type { Expense } from "~/types/models";
import type { CreateExpenseRequest } from "~/types/api";

export const useExpenses = () => {
  const { apiFetch } = useApi();

  const fetchExpenses = async (projectId: string) => {
    return await apiFetch<{ expenses: Expense[]; summary: any }>(
      `/projects/${projectId}/expenses`
    );
  };

  const fetchExpense = async (expenseId: string) => {
    return await apiFetch<Expense>(`/expenses/${expenseId}`);
  };

  const createExpense = async (
    projectId: string,
    data: CreateExpenseRequest
  ) => {
    return await apiFetch<Expense>(`/projects/${projectId}/expenses`, {
      method: "POST",
      body: data,
    });
  };

  const updateExpense = async (
    expenseId: string,
    data: Partial<CreateExpenseRequest>
  ) => {
    return await apiFetch<Expense>(`/expenses/${expenseId}`, {
      method: "PUT",
      body: data,
    });
  };

  const deleteExpense = async (expenseId: string) => {
    return await apiFetch(`/expenses/${expenseId}`, {
      method: "DELETE",
    });
  };

  return {
    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
