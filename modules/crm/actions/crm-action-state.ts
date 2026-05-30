/** Состояние форм CRM — отдельно от "use server" (Next.js 16: только async exports). */

export type CrmActionState = {
  ok: boolean;
  message: string;
};

export const initialCrmActionState: CrmActionState = {
  ok: true,
  message: "",
};
