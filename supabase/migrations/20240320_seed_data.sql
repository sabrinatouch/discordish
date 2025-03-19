-- Insert dummy users
INSERT INTO users (username, email, password_hash, avatar_url, status)
VALUES
  ('John Doe', 'john@example.com', crypt('password123', gen_salt('bf')), 'https://i.pravatar.cc/150?img=1', 'online'),
  ('Jane Smith', 'jane@example.com', crypt('password123', gen_salt('bf')), 'https://i.pravatar.cc/150?img=2', 'away'),
  ('Mike Johnson', 'mike@example.com', crypt('password123', gen_salt('bf')), 'https://i.pravatar.cc/150?img=3', 'dnd'),
  ('Sarah Wilson', 'sarah@example.com', crypt('password123', gen_salt('bf')), 'https://i.pravatar.cc/150?img=4', 'offline'),
  ('Alex Brown', 'alex@example.com', crypt('password123', gen_salt('bf')), 'https://i.pravatar.cc/150?img=5', 'invisible')
RETURNING id, username;

-- Store the generated IDs for use in other tables
DO $$
DECLARE
  john_id UUID;
  jane_id UUID;
  mike_id UUID;
  sarah_id UUID;
  alex_id UUID;
BEGIN
  -- Get the generated IDs
  SELECT id INTO john_id FROM users WHERE username = 'John Doe';
  SELECT id INTO jane_id FROM users WHERE username = 'Jane Smith';
  SELECT id INTO mike_id FROM users WHERE username = 'Mike Johnson';
  SELECT id INTO sarah_id FROM users WHERE username = 'Sarah Wilson';
  SELECT id INTO alex_id FROM users WHERE username = 'Alex Brown';

  -- Insert dummy servers
  INSERT INTO servers (name, owner_id, icon_url, description)
  VALUES
    ('Gaming Community', john_id, 'https://i.pravatar.cc/150?img=4', 'A community for gamers to connect and play together'),
    ('Tech Discussion', jane_id, 'https://i.pravatar.cc/150?img=5', 'Discuss the latest in technology and programming'),
    ('Art & Design', mike_id, 'https://i.pravatar.cc/150?img=6', 'Share your creative work and get feedback')
  RETURNING id;

  -- Insert server members
  INSERT INTO server_members (server_id, user_id, role)
  VALUES
    -- Gaming Community members
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), john_id, 'owner'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), jane_id, 'admin'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), mike_id, 'member'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), sarah_id, 'member'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), alex_id, 'member'),
    
    -- Tech Discussion members
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), jane_id, 'owner'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), john_id, 'admin'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), mike_id, 'member'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), sarah_id, 'member'),
    
    -- Art & Design members
    ((SELECT id FROM servers WHERE name = 'Art & Design'), mike_id, 'owner'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), jane_id, 'admin'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), john_id, 'member'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), alex_id, 'member');

  -- Insert channels
  INSERT INTO channels (server_id, name, type)
  VALUES
    -- Gaming Community channels
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), 'general', 'text'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), 'gaming', 'text'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), 'announcements', 'text'),
    ((SELECT id FROM servers WHERE name = 'Gaming Community'), 'voice-chat', 'voice'),
    
    -- Tech Discussion channels
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), 'general', 'text'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), 'programming', 'text'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), 'help', 'text'),
    ((SELECT id FROM servers WHERE name = 'Tech Discussion'), 'meeting-room', 'voice'),
    
    -- Art & Design channels
    ((SELECT id FROM servers WHERE name = 'Art & Design'), 'general', 'text'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), 'showcase', 'text'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), 'feedback', 'text'),
    ((SELECT id FROM servers WHERE name = 'Art & Design'), 'collaboration', 'voice')
  RETURNING id;

  -- Insert messages
  INSERT INTO messages (channel_id, user_id, content, created_at)
  VALUES
    -- Gaming Community messages
    ((SELECT id FROM channels WHERE name = 'general' AND server_id = (SELECT id FROM servers WHERE name = 'Gaming Community')), john_id, 'Hey everyone! Welcome to the Gaming Community server!', '2024-03-19T10:00:00Z'),
    ((SELECT id FROM channels WHERE name = 'general' AND server_id = (SELECT id FROM servers WHERE name = 'Gaming Community')), jane_id, 'Hi! Looking forward to gaming with you all!', '2024-03-19T10:05:00Z'),
    ((SELECT id FROM channels WHERE name = 'gaming' AND server_id = (SELECT id FROM servers WHERE name = 'Gaming Community')), mike_id, 'Anyone up for some competitive gaming?', '2024-03-19T10:10:00Z'),
    ((SELECT id FROM channels WHERE name = 'gaming' AND server_id = (SELECT id FROM servers WHERE name = 'Gaming Community')), john_id, 'I''m in! What game are you thinking?', '2024-03-19T10:15:00Z'),
    
    -- Tech Discussion messages
    ((SELECT id FROM channels WHERE name = 'general' AND server_id = (SELECT id FROM servers WHERE name = 'Tech Discussion')), jane_id, 'Let''s discuss the latest tech trends!', '2024-03-19T10:20:00Z'),
    ((SELECT id FROM channels WHERE name = 'programming' AND server_id = (SELECT id FROM servers WHERE name = 'Tech Discussion')), john_id, 'I''m working on a new React project. Any tips?', '2024-03-19T10:25:00Z'),
    ((SELECT id FROM channels WHERE name = 'programming' AND server_id = (SELECT id FROM servers WHERE name = 'Tech Discussion')), mike_id, 'Check out the new TypeScript features!', '2024-03-19T10:30:00Z'),
    
    -- Art & Design messages
    ((SELECT id FROM channels WHERE name = 'general' AND server_id = (SELECT id FROM servers WHERE name = 'Art & Design')), mike_id, 'Welcome to the Art & Design community!', '2024-03-19T10:35:00Z'),
    ((SELECT id FROM channels WHERE name = 'showcase' AND server_id = (SELECT id FROM servers WHERE name = 'Art & Design')), jane_id, 'Just finished a new UI design. Would love feedback!', '2024-03-19T10:40:00Z'),
    ((SELECT id FROM channels WHERE name = 'showcase' AND server_id = (SELECT id FROM servers WHERE name = 'Art & Design')), alex_id, 'The color scheme looks great!', '2024-03-19T10:45:00Z');

  -- Insert direct messages
  INSERT INTO direct_messages (sender_id, receiver_id, content, created_at)
  VALUES
    (john_id, jane_id, 'Hey Jane, want to play some games later?', '2024-03-19T11:00:00Z'),
    (jane_id, john_id, 'Sure! What time works for you?', '2024-03-19T11:05:00Z'),
    (mike_id, sarah_id, 'Can you review my latest code changes?', '2024-03-19T11:10:00Z'),
    (sarah_id, mike_id, 'I''ll take a look at it now.', '2024-03-19T11:15:00Z');

  -- Insert reactions
  INSERT INTO reactions (message_id, user_id, emoji)
  VALUES
    ((SELECT id FROM messages WHERE content LIKE 'Hey everyone!%'), jane_id, '👋'),
    ((SELECT id FROM messages WHERE content LIKE 'Hey everyone!%'), mike_id, '👋'),
    ((SELECT id FROM messages WHERE content LIKE 'Hi! Looking forward%'), john_id, '🎮'),
    ((SELECT id FROM messages WHERE content LIKE 'Let''s discuss the latest%'), john_id, '💻'),
    ((SELECT id FROM messages WHERE content LIKE 'Just finished a new UI%'), john_id, '🎨'),
    ((SELECT id FROM messages WHERE content LIKE 'Just finished a new UI%'), mike_id, '🎨');

  -- Insert search index entries (optional)
  INSERT INTO search_index (message_id, content_vector)
  VALUES
    ((SELECT id FROM messages WHERE content LIKE 'Hey everyone!%'), '[0.1, 0.2, 0.3, ...]'),
    ((SELECT id FROM messages WHERE content LIKE 'Hi! Looking forward%'), '[0.2, 0.3, 0.4, ...]'),
    ((SELECT id FROM messages WHERE content LIKE 'Anyone up for some%'), '[0.3, 0.4, 0.5, ...]');
END $$; 