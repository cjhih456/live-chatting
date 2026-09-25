export type UserId = string;
export type ConversationId = string;
export type MessageId = string;
export type FriendId = string;

export type ConversationFilter = 'all' | 'unread' | 'group';

export interface Profile {
  id: UserId;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
}

export interface Friend {
  id: FriendId;
  name: string;
  email: string;
  avatarUrl: string | null;
  online: boolean;
}

export interface Conversation {
  id: ConversationId;
  title: string;
  preview: string;
  updatedAt: string;
  unreadCount: number;
  isGroup: boolean;
  avatarUrl: string | null;
}

export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  body: string;
  createdAt: string;
  failed?: boolean;
}

export const routeNames = {
  login: 'login',
  chats: 'chats',
  chat: 'chat',
  friends: 'friends',
  settings: 'settings',
  profileEdit: 'profile-edit',
  addFriend: 'add-friend',
} as const;

export const copy = {
  appName: 'Lumen',
  loginTitle: 'Lumen에 오신 것을 환영합니다',
  emailContinue: '이메일로 계속하기',
  chats: '채팅',
  friends: '친구',
  settings: '설정',
  filterAll: '전체',
  filterUnread: '안 읽음',
  filterGroup: '그룹',
  send: '전송',
  addFriend: '친구 추가',
  saveProfile: '저장',
  retry: '다시 시도',
  emptyChats: '대화가 없습니다',
  searchNone: '검색 결과가 없습니다',
  offline: '오프라인입니다',
  sendFailed: '메시지 전송에 실패했습니다',
} as const;
