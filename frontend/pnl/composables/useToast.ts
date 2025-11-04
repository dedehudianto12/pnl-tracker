import { toast as sonnerToast } from "vue-sonner";

export const useToast = () => {
  const success = (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
      duration: 3000,
    });
  };

  const error = (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
      duration: 5000,
    });
  };

  return {
    success,
    error,
    toast: sonnerToast,
  };
};
