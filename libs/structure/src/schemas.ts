import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, '이메일을 입력하세요')
  .email('올바른 이메일을 입력하세요');

/** @deprecated Use oauthLoginSchema for authentication. */
export const emailLoginSchema = z.object({
  email: emailSchema,
});

/** @deprecated Use OAuthLoginInput for authentication. */
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;

export const oauthProviderSchema = z.enum(['google', 'apple', 'kakao']);

export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

export const oauthLoginSchema = z.object({
  provider: oauthProviderSchema,
});

export type OAuthLoginInput = z.infer<typeof oauthLoginSchema>;

export const themeSchema = z.enum(['light', 'dark', 'system']);

export type ThemeMode = z.infer<typeof themeSchema>;

export const localeSchema = z.enum(['ko', 'en', 'ja']);

export type AppLocale = z.infer<typeof localeSchema>;

export const userSettingsSchema = z.object({
  theme: themeSchema,
  locale: localeSchema,
  notificationsEnabled: z.boolean(),
  soundEnabled: z.boolean(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const userSettingsUpdateSchema = userSettingsSchema.partial();

export type UserSettingsUpdateInput = z.infer<typeof userSettingsUpdateSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요').max(40),
  bio: z.string().max(160).default(''),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const addFriendSchema = z.object({
  email: emailSchema,
});

export type AddFriendInput = z.infer<typeof addFriendSchema>;

export const messageComposeSchema = z.object({
  body: z.string().min(1, '메시지를 입력하세요').max(2000),
});

export type MessageComposeInput = z.infer<typeof messageComposeSchema>;

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  bio: z.string(),
  avatarUrl: z.string().nullable(),
});

export const friendSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  online: z.boolean(),
});

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  preview: z.string(),
  updatedAt: z.string(),
  unreadCount: z.number().int().nonnegative(),
  isGroup: z.boolean(),
  avatarUrl: z.string().nullable(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  body: z.string(),
  createdAt: z.string(),
  failed: z.boolean().optional(),
});

export const conversationListSchema = z.object({
  items: z.array(conversationSchema),
});

export const messageListSchema = z.object({
  items: z.array(messageSchema),
});

export const friendListSchema = z.object({
  items: z.array(friendSchema),
});

export const authSessionSchema = z.object({
  token: z.string(),
  profile: profileSchema,
});

export const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});
