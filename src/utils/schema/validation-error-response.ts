import z from "zod";

export const validationErrorResponse = z.object({
  message: z.string(),
  issues: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
}).describe('Validation error');