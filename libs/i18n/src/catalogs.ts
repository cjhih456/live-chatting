export type Locale = 'ko' | 'en' | 'ja';

export type MessageKey =
  | 'appName'
  | 'settings'
  | 'notifications'
  | 'pushNotifications'
  | 'pushHint'
  | 'notificationSound'
  | 'soundHint'
  | 'contentPreview'
  | 'previewHint'
  | 'language'
  | 'theme'
  | 'themeLight'
  | 'themeDark'
  | 'themeSystem'
  | 'snsLink'
  | 'connected'
  | 'connect'
  | 'logout'
  | 'editProfile'
  | 'save'
  | 'name'
  | 'bio'
  | 'loginTitle'
  | 'loginHeadline'
  | 'loginSubhead'
  | 'loginWebTitle'
  | 'loginWebSub'
  | 'loginPitch'
  | 'loginPitchSub'
  | 'loginFoot'
  | 'loginLegal'
  | 'continueGoogle'
  | 'continueApple'
  | 'continueKakao';

export type Catalog = Record<MessageKey, string>;

export const catalogs: Record<Locale, Catalog> = {
  ko: {
    appName: 'Lumen',
    settings: '설정',
    notifications: '알림',
    pushNotifications: '푸시 알림',
    pushHint: '새 메시지와 멘션',
    notificationSound: '알림 소리',
    soundHint: '수신 시 소리 재생',
    contentPreview: '내용 미리보기',
    previewHint: '잠금 화면에 메시지 표시',
    language: '언어',
    theme: '테마',
    themeLight: '라이트',
    themeDark: '다크',
    themeSystem: '시스템',
    snsLink: 'SNS 연동',
    connected: '연결됨',
    connect: '연결',
    logout: '로그아웃',
    editProfile: '프로필 편집',
    save: '저장',
    name: '이름',
    bio: '소개',
    loginTitle: '시작하기',
    loginHeadline: '지금, 대화를 이어가세요',
    loginSubhead: 'Google, Apple, Kakao 계정으로 바로 시작하세요.',
    loginWebTitle: '시작하기',
    loginWebSub: 'SNS 계정으로 로그인하면 바로 대화를 이어갈 수 있습니다.',
    loginPitch: '대화가 끊기지 않는\n실시간 메신저',
    loginPitchSub:
      '모바일과 PC에서 같은 대화를 이어가세요. 읽음, 입력 중, 알림까지 한 화면에서.',
    loginFoot: '채팅 · 친구 · 설정',
    loginLegal: '계속하면 이용약관과 개인정보 처리방침에 동의하게 됩니다.',
    continueGoogle: 'Google로 계속',
    continueApple: 'Apple로 계속',
    continueKakao: 'Kakao로 계속',
  },
  en: {
    appName: 'Lumen',
    settings: 'Settings',
    notifications: 'Notifications',
    pushNotifications: 'Push notifications',
    pushHint: 'New messages and mentions',
    notificationSound: 'Notification sound',
    soundHint: 'Play sound on receive',
    contentPreview: 'Content preview',
    previewHint: 'Show message on lock screen',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    snsLink: 'SNS accounts',
    connected: 'Connected',
    connect: 'Connect',
    logout: 'Log out',
    editProfile: 'Edit profile',
    save: 'Save',
    name: 'Name',
    bio: 'Bio',
    loginTitle: 'Get started',
    loginHeadline: 'Pick up the conversation now',
    loginSubhead: 'Start instantly with Google, Apple, or Kakao.',
    loginWebTitle: 'Get started',
    loginWebSub: 'Sign in with SNS to continue chatting right away.',
    loginPitch: 'Realtime messaging\nthat stays in sync',
    loginPitchSub:
      'Continue the same chats on mobile and PC — read receipts, typing, and alerts in one place.',
    loginFoot: 'Chats · Friends · Settings',
    loginLegal: 'By continuing, you agree to the Terms and Privacy Policy.',
    continueGoogle: 'Continue with Google',
    continueApple: 'Continue with Apple',
    continueKakao: 'Continue with Kakao',
  },
  ja: {
    appName: 'Lumen',
    settings: '設定',
    notifications: '通知',
    pushNotifications: 'プッシュ通知',
    pushHint: '新しいメッセージとメンション',
    notificationSound: '通知音',
    soundHint: '受信時に音を再生',
    contentPreview: '内容のプレビュー',
    previewHint: 'ロック画面にメッセージを表示',
    language: '言語',
    theme: 'テーマ',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    themeSystem: 'システム',
    snsLink: 'SNS連携',
    connected: '接続済み',
    connect: '接続',
    logout: 'ログアウト',
    editProfile: 'プロフィール編集',
    save: '保存',
    name: '名前',
    bio: '紹介',
    loginTitle: 'はじめる',
    loginHeadline: '今すぐ会話をつなげましょう',
    loginSubhead: 'Google・Apple・Kakaoアカウントですぐ始められます。',
    loginWebTitle: 'はじめる',
    loginWebSub: 'SNSアカウントでログインするとすぐに会話を続けられます。',
    loginPitch: '途切れない\nリアルタイムメッセンジャー',
    loginPitchSub:
      'モバイルとPCで同じ会話を。既読・入力中・通知までひとつの画面で。',
    loginFoot: 'チャット · 友だち · 設定',
    loginLegal: '続行すると利用規約とプライバシーポリシーに同意したことになります。',
    continueGoogle: 'Googleで続ける',
    continueApple: 'Appleで続ける',
    continueKakao: 'Kakaoで続ける',
  },
};

export const localeLabels: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

export const locales: Locale[] = ['ko', 'en', 'ja'];
