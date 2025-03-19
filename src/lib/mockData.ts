export const mockUsers = [
  {
    id: '1',
    username: 'John Doe',
    avatar_url: 'https://i.pravatar.cc/150?img=1',
    status: 'online' as const,
    bio: 'Software developer and coffee enthusiast',
  },
  {
    id: '2',
    username: 'Jane Smith',
    avatar_url: 'https://i.pravatar.cc/150?img=2',
    status: 'idle' as const,
    bio: 'UI/UX Designer | Love creating beautiful interfaces',
  },
  {
    id: '3',
    username: 'Mike Johnson',
    avatar_url: 'https://i.pravatar.cc/150?img=3',
    status: 'dnd' as const,
    bio: 'Product Manager | Building the future of communication',
  },
  {
    id: '4',
    username: 'Sarah Wilson',
    avatar_url: 'https://i.pravatar.cc/150?img=4',
    status: 'offline' as const,
    bio: 'Backend Developer | Coffee addict',
  },
  {
    id: '5',
    username: 'Alex Brown',
    avatar_url: 'https://i.pravatar.cc/150?img=5',
    status: 'invisible' as const,
    bio: 'Full Stack Developer | Night owl',
  },
];

export const mockServers = [
  {
    id: '1',
    name: 'Gaming Community',
    icon_url: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '2',
    name: 'Tech Discussion',
    icon_url: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '3',
    name: 'Art & Design',
    icon_url: 'https://i.pravatar.cc/150?img=6',
  },
];

export const mockChannels = [
  {
    id: '1',
    name: 'general',
    type: 'text' as const,
    server_id: '1',
  },
  {
    id: '2',
    name: 'gaming',
    type: 'text' as const,
    server_id: '1',
  },
  {
    id: '3',
    name: 'announcements',
    type: 'text' as const,
    server_id: '1',
  },
  {
    id: '4',
    name: 'general',
    type: 'text' as const,
    server_id: '2',
  },
  {
    id: '5',
    name: 'programming',
    type: 'text' as const,
    server_id: '2',
  },
];

export const mockMessages = [
  {
    id: '1',
    content: 'Hey everyone! Welcome to the Gaming Community server!',
    user_id: '1',
    channel_id: '1',
    created_at: '2024-03-19T10:00:00Z',
    user: mockUsers[0],
  },
  {
    id: '2',
    content: 'Hi! Looking forward to gaming with you all!',
    user_id: '2',
    channel_id: '1',
    created_at: '2024-03-19T10:05:00Z',
    user: mockUsers[1],
  },
  {
    id: '3',
    content: 'Anyone up for some competitive gaming?',
    user_id: '3',
    channel_id: '2',
    created_at: '2024-03-19T10:10:00Z',
    user: mockUsers[2],
  },
  {
    id: '4',
    content: 'I\'m in! What game are you thinking?',
    user_id: '1',
    channel_id: '2',
    created_at: '2024-03-19T10:15:00Z',
    user: mockUsers[0],
  },
  {
    id: '5',
    content: 'Let\'s discuss the latest tech trends!',
    user_id: '2',
    channel_id: '4',
    created_at: '2024-03-19T10:20:00Z',
    user: mockUsers[1],
  },
];

export const mockUserSettings = {
  theme: 'dark' as const,
  notifications: true,
  language: 'en',
}; 