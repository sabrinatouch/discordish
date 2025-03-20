-- Insert test direct messages between test users
DO $$
DECLARE
  test_user_id UUID;
  test_user2_id UUID;
BEGIN
  -- Get the user IDs
  SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';
  SELECT id INTO test_user2_id FROM users WHERE email = 'test2@example.com';

  -- Insert direct messages
  INSERT INTO direct_messages (sender_id, receiver_id, content, created_at)
  VALUES
    -- Messages from testuser to testuser2
    (test_user_id, test_user2_id, 'Hey there! How are you?', '2024-03-20T10:00:00Z'),
    (test_user_id, test_user2_id, 'I''m working on a new feature for our app', '2024-03-20T10:01:00Z'),
    (test_user_id, test_user2_id, 'Would you like to help me test it?', '2024-03-20T10:02:00Z'),
    
    -- Messages from testuser2 to testuser
    (test_user2_id, test_user_id, 'Hi! I''m doing great, thanks!', '2024-03-20T10:03:00Z'),
    (test_user2_id, test_user_id, 'That sounds interesting! What kind of feature?', '2024-03-20T10:04:00Z'),
    (test_user2_id, test_user_id, 'Of course! I''d be happy to help test', '2024-03-20T10:05:00Z'),
    
    -- More messages from testuser to testuser2
    (test_user_id, test_user2_id, 'It''s a direct messaging feature', '2024-03-20T10:06:00Z'),
    (test_user_id, test_user2_id, 'We''re testing it right now! 😊', '2024-03-20T10:07:00Z'),
    
    -- More messages from testuser2 to testuser
    (test_user2_id, test_user_id, 'That''s awesome! The messages are coming through perfectly', '2024-03-20T10:08:00Z'),
    (test_user2_id, test_user_id, 'The UI looks clean and modern too', '2024-03-20T10:09:00Z'),
    
    -- Final messages from testuser to testuser2
    (test_user_id, test_user2_id, 'Thanks! I''m glad you like it', '2024-03-20T10:10:00Z'),
    (test_user_id, test_user2_id, 'Let me know if you notice any issues or have suggestions', '2024-03-20T10:11:00Z');
END $$; 