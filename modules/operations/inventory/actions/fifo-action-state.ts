/** Состояние формы FIFO OUT — отдельно от "use server" (Next.js 16: только async exports). */

export type FifoActionState = {
  ok: boolean;
  message: string;
};

export const initialFifoActionState: FifoActionState = {
  ok: true,
  message: "",
};
