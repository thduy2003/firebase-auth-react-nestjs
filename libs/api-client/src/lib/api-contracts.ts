import { initContract } from "@ts-rest/core";
import { z } from "zod";

export type User = {
  name: string | null;
  email: string;
  img: string | null;
}
const c = initContract();
// c type is simply a way to define the type without enforcing a runtime validation
// simple z validates the data, it makes sure that the data comes with this format
export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/login',
    body: c.type<null>(),
    headers: z.object({
      authorization: z.string().startsWith('Bearer ')
    }),
    strictStatusCodes: true,
    responses: {
      200: c.type<User>(),
      400: c.type<{message: string}>(),
      401: c.type<{message: string}>(),
      404: c.type<{message: string}>(),
      500: c.type<{message: string}>()
    }
  }
}, {
  pathPrefix: '/auth'
})