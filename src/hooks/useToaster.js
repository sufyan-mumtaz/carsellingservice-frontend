import toast from "react-hot-toast";

export const useToaster = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      duration: 4000,
    });
  };

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      duration: 4000,
    });
  };

  return { showSuccess, showError };
};
