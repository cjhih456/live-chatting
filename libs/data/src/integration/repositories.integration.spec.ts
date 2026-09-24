import {
  authRepository,
  conversationRepository,
  friendRepository,
  profileRepository,
  settingsRepository,
} from '../repositories';
import { createMockServer } from '../msw/node';
import { API_PREFIX } from '../client';

describe('data repositories against OpenAPI MSW', () => {
  const serverPromise = createMockServer();

  beforeAll(async () => {
    const server = await serverPromise;
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(async () => {
    const server = await serverPromise;
    server.close();
  });

  it('uses the mock API origin', () => {
    expect(API_PREFIX).toBe('http://127.0.0.1:4010');
  });

  it('logs in with OAuth and design example profile', async () => {
    const session = await authRepository.oauthLogin({ provider: 'google' });
    expect(session.profile.name).toBe('최인환');
    expect(session.profile.email).toBe('inhwan@lumen.app');
  });

  it('lists conversations from example', async () => {
    const list = await conversationRepository.list('all');
    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items[0]?.title).toBe('김서연');
  });

  it('persists sent messages on subsequent GET', async () => {
    const before = await conversationRepository.listMessages('conv-1');
    const initialCount = before.items.length;

    await conversationRepository.sendMessage('conv-1', {
      body: '상태 유지 테스트',
    });

    const after = await conversationRepository.listMessages('conv-1');
    expect(after.items.length).toBe(initialCount + 1);
    expect(after.items.at(-1)?.body).toBe('상태 유지 테스트');
  });

  it('updates conversation preview after send', async () => {
    await conversationRepository.sendMessage('conv-1', {
      body: '미리보기 갱신',
    });
    const list = await conversationRepository.list('all');
    const conv = list.items.find((c) => c.id === 'conv-1');
    expect(conv?.preview).toBe('미리보기 갱신');
  });

  it('adds a friend and lists it on subsequent GET', async () => {
    const before = await friendRepository.list();
    await friendRepository.add({ email: 'newfriend@lumen.app' });
    const after = await friendRepository.list();
    expect(after.items.length).toBe(before.items.length + 1);
    expect(after.items.some((f) => f.email === 'newfriend@lumen.app')).toBe(
      true,
    );
  });

  it('returns updated profile name after PATCH then GET', async () => {
    await profileRepository.update({
      name: '테스트 이름',
      bio: 'bio',
    });
    const profile = await profileRepository.get();
    expect(profile.name).toBe('테스트 이름');
  });

  it('reads and updates settings', async () => {
    const initial = await settingsRepository.get();
    expect(initial.theme).toBe('system');
    expect(initial.locale).toBe('ko');

    const updated = await settingsRepository.update({ theme: 'dark' });
    expect(updated.theme).toBe('dark');

    const again = await settingsRepository.get();
    expect(again.theme).toBe('dark');
  });

  it('surfaces send failure example', async () => {
    await expect(
      conversationRepository.sendMessageFail('conv-1', { body: '실패' }),
    ).rejects.toThrow(/메시지 전송에 실패했습니다/);
  });
});
