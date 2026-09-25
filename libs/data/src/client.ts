import ky from 'ky';

export const API_PREFIX =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_API_ORIGIN ??
      process.env.EXPO_PUBLIC_API_ORIGIN)) ||
  'http://127.0.0.1:4010';

export const api = ky.create({
  prefixUrl: API_PREFIX,
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response) {
          try {
            const body = (await response.json()) as { message?: string };
            if (body.message) {
              error.message = body.message;
            }
          } catch {
            // keep default message
          }
        }
        return error;
      },
    ],
  },
});
