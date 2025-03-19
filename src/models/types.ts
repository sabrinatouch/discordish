export enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  DND = 'dnd',
  INVISIBLE = 'invisible'
}

export enum ServerMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MOD = 'mod',
  MEMBER = 'member'
}

export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice'
}

export interface BaseModel {
  id: string;
  created_at: Date;
}

export interface User extends BaseModel {
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  status: UserStatus;
}

export interface Server extends BaseModel {
  name: string;
  owner_id: string;
  icon_url: string;
  description: string;
}

export interface ServerMember extends BaseModel {
  server_id: string;
  user_id: string;
  role: ServerMemberRole;
  joined_at: Date;
}

export interface Channel extends BaseModel {
  server_id: string;
  name: string;
  type: ChannelType;
}

export interface Reaction extends BaseModel {
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface Message extends BaseModel {
  channel_id: string;
  user_id: string;
  content: string;
  file_url?: string;
  reply_to_id?: string;
  reactions?: Reaction[];
}

export interface DirectMessage extends BaseModel {
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url?: string;
} 