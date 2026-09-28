import { by, device, element, expect as detoxExpect } from 'detox';

describe('Lumen app smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows SNS login without email field and opens chats', async () => {
    await detoxExpect(element(by.text('Google로 계속'))).toBeVisible();
    await detoxExpect(element(by.text('이메일'))).not.toBeVisible();
    await element(by.text('Google로 계속')).tap();
    await detoxExpect(element(by.text('채팅'))).toBeVisible();
  });

  it('changes language and theme on settings', async () => {
    await element(by.text('설정')).tap();
    await detoxExpect(element(by.text('설정'))).toBeVisible();
    await element(by.text('English')).tap();
    await detoxExpect(element(by.text('Settings'))).toBeVisible();
    await element(by.text('Dark')).tap();
    await detoxExpect(element(by.text('Theme'))).toBeVisible();
  });
});
