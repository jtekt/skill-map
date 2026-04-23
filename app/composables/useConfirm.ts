interface ConfirmOptions {
  text: string;
  confirmText?: string;
  cancelText?: string;
  color?: "primary" | "error" | "warning";
}

export const useConfirm = () => {
  const state = useState<{
    visible: boolean;
    options: ConfirmOptions | null;
    resolve?: (value: boolean) => void;
  }>("confirm_state", () => ({
    visible: false,
    options: null,
  }));

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    state.value.visible = true;
    state.value.options = options;

    return new Promise((resolve) => {
      state.value.resolve = resolve;
    });
  };

  const accept = () => {
    state.value.resolve?.(true);
    reset();
  };

  const cancel = () => {
    state.value.resolve?.(false);
    reset();
  };

  const reset = () => {
    state.value.visible = false;
    state.value.options = null;
    state.value.resolve = undefined;
  };

  return {
    state,
    confirm,
    accept,
    cancel,
  };
};
