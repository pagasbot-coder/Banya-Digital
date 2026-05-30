/** Состояние форм finance — отдельно от "use server" (Next.js 16: только async exports). */

export type FinanceActionState = {
  ok: boolean;
  message: string;
};

export const initialFinanceActionState: FinanceActionState = {
  ok: true,
  message: "",
};
