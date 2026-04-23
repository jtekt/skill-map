interface Toast {
  text: string;
  color?: "success" | "error" | "info" | "warning";
  timeout?: number;
}

export const useToast = () => {
  const queue = useState<Toast[]>("toast_queue", () => []);

  const showToast = (
    text: string,
    color: Toast["color"] = "info",
    timeout: number = 3000,
  ) => {
    queue.value.push({ text, color, timeout });
  };

  return {
    queue,
    showToast,
  };
};
