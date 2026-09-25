import { openApiDocument } from '@lumen/structure';
import type {
  Conversation,
  ConversationFilter,
  Friend,
  Message,
  Profile,
} from '@lumen/structure';

type OpenApiDoc = {
  paths: Record<
    string,
    Record<
      string,
      {
        responses?: Record<
          string,
          {
            content?: {
              'application/json'?: { example?: unknown };
            };
          }
        >;
      }
    >
  >;
};

export type OAuthProvider = 'google' | 'apple' | 'kakao';

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  locale: 'ko' | 'en' | 'ja';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
};

type AuthSession = {
  token: string;
  profile: Profile;
};

type StoreState = {
  profile: Profile;
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  friends: Friend[];
  settings: UserSettings;
};

let messageSeq = 0;
let friendSeq = 0;

function nextMessageId() {
  messageSeq += 1;
  return `msg-${messageSeq}`;
}

function nextFriendId() {
  friendSeq += 1;
  return `friend-${messageSeq}-${friendSeq}`;
}

function exampleAt(
  doc: OpenApiDoc,
  path: string,
  method: string,
  status = '200',
): unknown {
  return doc.paths[path]?.[method]?.responses?.[status]?.content?.[
    'application/json'
  ]?.example;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function buildInitialState(): StoreState {
  const doc = openApiDocument as OpenApiDoc;

  const authExample = exampleAt(doc, '/auth/oauth', 'post') as
    | AuthSession
    | undefined;
  const profileExample =
    (exampleAt(doc, '/profile', 'get') as Profile | undefined) ??
    authExample?.profile;
  const conversationsExample = exampleAt(doc, '/conversations', 'get') as
    | { items: Conversation[] }
    | undefined;
  const messagesExample = exampleAt(
    doc,
    '/conversations/{conversationId}/messages',
    'get',
  ) as { items: Message[] } | undefined;
  const friendsExample = exampleAt(doc, '/friends', 'get') as
    | { items: Friend[] }
    | undefined;
  const settingsExample = exampleAt(doc, '/settings', 'get') as
    | UserSettings
    | undefined;

  if (!profileExample) {
    throw new Error('OpenAPI seed missing profile example');
  }

  const conversations = clone(conversationsExample?.items ?? []);
  const messagesByConversation: Record<string, Message[]> = {};

  if (messagesExample?.items?.length) {
    const conversationId = messagesExample.items[0]?.conversationId ?? null;
    messagesByConversation[conversationId] = clone(messagesExample.items);
  }

  for (const conversation of conversations) {
    if (!messagesByConversation[conversation.id]) {
      messagesByConversation[conversation.id] = [];
    }
  }

  messageSeq = messagesExample?.items?.length ?? 0;
  friendSeq = friendsExample?.items?.length ?? 0;

  return {
    profile: clone(profileExample),
    conversations: clone(conversations),
    messagesByConversation,
    friends: clone(friendsExample?.items ?? []),
    settings: clone(
      settingsExample ?? {
        theme: 'system',
        locale: 'ko',
        notificationsEnabled: true,
        soundEnabled: true,
      },
    ),
  };
}

const STORAGE_KEY = 'lumen-mock-store-v1';

function canUseSessionStorage() {
  return (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.sessionStorage !== 'undefined'
  );
}

function readPersistedState(): StoreState | null {
  if (!canUseSessionStorage()) {
    return null;
  }
  try {
    const raw = globalThis.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoreState;
  } catch {
    return null;
  }
}

function persistState() {
  if (!canUseSessionStorage()) {
    return;
  }
  try {
    globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

function loadState(): StoreState {
  return readPersistedState() ?? buildInitialState();
}

let state: StoreState = loadState();

export function resetStore() {
  if (canUseSessionStorage()) {
    globalThis.sessionStorage.removeItem(STORAGE_KEY);
  }
  state = buildInitialState();
  persistState();
}

export const mockStore = {
  getProfile(): Profile {
    return clone(state.profile);
  },

  updateProfile(input: { name: string; bio?: string }): Profile {
    state.profile = {
      ...state.profile,
      name: input.name,
      bio: input.bio ?? state.profile.bio,
    };
    persistState();
    return clone(state.profile);
  },

  listConversations(filter: ConversationFilter = 'all'): { items: Conversation[] } {
    let items = [...state.conversations];
    if (filter === 'unread') {
      items = items.filter((c) => c.unreadCount > 0);
    } else if (filter === 'group') {
      items = items.filter((c) => c.isGroup);
    }
    items.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return { items: clone(items) };
  },

  listMessages(conversationId: string): { items: Message[] } {
    const items = state.messagesByConversation[conversationId] ?? [];
    return { items: clone(items) };
  },

  sendMessage(
    conversationId: string,
    body: string,
  ): Message {
    const createdAt = new Date().toISOString();
    const message: Message = {
      id: nextMessageId(),
      conversationId,
      senderId: state.profile.id,
      body,
      createdAt,
    };

    if (!state.messagesByConversation[conversationId]) {
      state.messagesByConversation[conversationId] = [];
    }
    state.messagesByConversation[conversationId].push(message);

    const conversation = state.conversations.find(
      (c) => c.id === conversationId,
    );
    if (conversation) {
      conversation.preview = body;
      conversation.updatedAt = createdAt;
    }

    persistState();
    return clone(message);
  },

  addFriend(email: string): Friend {
    const friend: Friend = {
      id: nextFriendId(),
      name: '새 친구',
      email,
      avatarUrl: null,
      online: false,
    };
    state.friends.push(friend);
    persistState();
    return clone(friend);
  },

  listFriends(): { items: Friend[] } {
    return { items: clone(state.friends) };
  },

  getSettings(): UserSettings {
    return clone(state.settings);
  },

  updateSettings(patch: Partial<UserSettings>): UserSettings {
    state.settings = { ...state.settings, ...patch };
    persistState();
    return clone(state.settings);
  },

  createOAuthSession(provider: OAuthProvider): AuthSession {
    void provider;
    return {
      token: 'mock-token-inhwan',
      profile: clone(state.profile),
    };
  },

  reset() {
    resetStore();
  },
};
