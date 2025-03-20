-- First, create the user through Supabase Auth
DO $$
DECLARE
  user_id UUID;
  password_hash TEXT;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test2@example.com',
    crypt('test123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Get the password hash from auth.users
  SELECT encrypted_password INTO password_hash FROM auth.users WHERE id = user_id;

  -- Then create the user profile in public.users
  INSERT INTO public.users (id, username, email, password_hash, avatar_url, status)
  VALUES (user_id, 'testuser2', 'test2@example.com', password_hash, 'https://i.pravatar.cc/150?img=2', 'online');

  -- Insert a test server for the user
  INSERT INTO servers (name, owner_id, icon_url, description)
  VALUES ('Test Server 2', user_id, 'https://i.pravatar.cc/150?img=3', 'A second test server for development');

  -- Add the user as a server member
  INSERT INTO server_members (server_id, user_id, role)
  VALUES ((SELECT id FROM servers WHERE name = 'Test Server 2'), user_id, 'owner');

  -- Insert a test channel
  INSERT INTO channels (server_id, name, type)
  VALUES ((SELECT id FROM servers WHERE name = 'Test Server 2'), 'general', 'text');

  -- Insert a test message
  INSERT INTO messages (channel_id, user_id, content, created_at)
  VALUES (
    (SELECT id FROM channels WHERE name = 'general' AND server_id = (SELECT id FROM servers WHERE name = 'Test Server 2')),
    user_id,
    'Welcome to the second test server!',
    CURRENT_TIMESTAMP
  );
END $$; 