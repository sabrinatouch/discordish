-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Create new policies for users table
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Add RLS policies for direct_messages table
CREATE POLICY "Users can view their direct messages" ON direct_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR
        auth.uid() = receiver_id
    );

CREATE POLICY "Users can send direct messages" ON direct_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can delete their own direct messages" ON direct_messages
    FOR DELETE USING (
        auth.uid() = sender_id
    ); 