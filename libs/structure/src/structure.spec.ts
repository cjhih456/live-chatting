import {
  oauthLoginSchema,
  profileUpdateSchema,
  userSettingsSchema,
  openApiDocument,
} from './index';

describe('structure schemas', () => {
  it('parses valid OAuth login', () => {
    expect(oauthLoginSchema.parse({ provider: 'google' })).toEqual({
      provider: 'google',
    });
  });

  it('rejects invalid OAuth provider', () => {
    expect(() => oauthLoginSchema.parse({ provider: 'bad' })).toThrow();
  });

  it('parses profile update', () => {
    expect(
      profileUpdateSchema.parse({ name: '최인환', bio: 'hello' }),
    ).toEqual({ name: '최인환', bio: 'hello' });
  });

  it('parses user settings', () => {
    expect(
      userSettingsSchema.parse({
        theme: 'system',
        locale: 'ko',
        notificationsEnabled: true,
        soundEnabled: false,
      }),
    ).toMatchObject({ theme: 'system', locale: 'ko' });
  });
});

describe('openapi document paths', () => {
  it('includes required API paths', () => {
    const paths = Object.keys(openApiDocument.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/auth/oauth',
        '/profile',
        '/conversations',
        '/conversations/{conversationId}/messages',
        '/conversations/{conversationId}/messages/fail',
        '/friends',
        '/settings',
      ]),
    );
  });

  it('embeds design example values', () => {
    const loginExample =
      openApiDocument.paths['/auth/oauth'].post.responses['200'].content[
        'application/json'
      ].example;
    expect(loginExample.profile.name).toBe('최인환');
    expect(loginExample.profile.email).toBe('inhwan@lumen.app');
  });
});
