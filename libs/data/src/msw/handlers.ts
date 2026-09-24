import { http, HttpResponse, type RequestHandler } from 'msw';
import { API_PREFIX } from '../client';
import { mockStore } from './store';

function baseUrl() {
  return API_PREFIX.replace(/\/$/, '');
}

/**
 * Stateful MSW handlers backed by an in-memory store seeded from OpenAPI examples.
 */
export function createHandlers(): RequestHandler[] {
  const root = baseUrl();

  return [
    http.post(`${root}/auth/oauth`, async ({ request }) => {
      const body = (await request.json()) as { provider?: string };
      const provider = body.provider ?? 'google';
      if (!['google', 'apple', 'kakao'].includes(provider)) {
        return HttpResponse.json(
          { message: '지원하지 않는 OAuth 제공자입니다', code: 'INVALID_PROVIDER' },
          { status: 400 },
        );
      }
      return HttpResponse.json(
        mockStore.createOAuthSession(
          provider as 'google' | 'apple' | 'kakao',
        ),
      );
    }),

    http.get(`${root}/profile`, () => {
      return HttpResponse.json(mockStore.getProfile());
    }),

    http.patch(`${root}/profile`, async ({ request }) => {
      const body = (await request.json()) as { name: string; bio?: string };
      return HttpResponse.json(mockStore.updateProfile(body));
    }),

    http.get(`${root}/conversations`, ({ request }) => {
      const url = new URL(request.url);
      const filter = (url.searchParams.get('filter') ?? 'all') as
        | 'all'
        | 'unread'
        | 'group';
      return HttpResponse.json(mockStore.listConversations(filter));
    }),

    http.get(`${root}/conversations/:conversationId/messages`, ({ params }) => {
      const conversationId = String(params.conversationId);
      return HttpResponse.json(mockStore.listMessages(conversationId));
    }),

    http.post(`${root}/conversations/:conversationId/messages`, async ({
      params,
      request,
    }) => {
      const conversationId = String(params.conversationId);
      const body = (await request.json()) as { body: string };
      return HttpResponse.json(
        mockStore.sendMessage(conversationId, body.body),
      );
    }),

    http.post(`${root}/conversations/:conversationId/messages/fail`, () => {
      return HttpResponse.json(
        {
          message: '메시지 전송에 실패했습니다',
          code: 'SEND_FAILED',
        },
        { status: 500 },
      );
    }),

    http.get(`${root}/friends`, () => {
      return HttpResponse.json(mockStore.listFriends());
    }),

    http.post(`${root}/friends`, async ({ request }) => {
      const body = (await request.json()) as { email: string };
      return HttpResponse.json(mockStore.addFriend(body.email));
    }),

    http.get(`${root}/settings`, () => {
      return HttpResponse.json(mockStore.getSettings());
    }),

    http.patch(`${root}/settings`, async ({ request }) => {
      const body = (await request.json()) as Parameters<
        typeof mockStore.updateSettings
      >[0];
      return HttpResponse.json(mockStore.updateSettings(body));
    }),
  ];
}

/** @deprecated Use createHandlers — kept for callers migrating from OpenAPI-only mocks. */
export async function createHandlersFromOpenApi(): Promise<RequestHandler[]> {
  return createHandlers();
}
