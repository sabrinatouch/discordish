Here's a `db_schema.md` file based on the screenshot you provided:

---

# 📦 Database Schema

This schema outlines the structure of a messaging application with support for servers, channels, direct messages, and reactions.

---

## 🧑‍💼 users

Stores user account information.

| Column      | Type        | Description              |
|-------------|-------------|--------------------------|
| id          | uuid        | Primary key              |
| username    | varchar     | Unique username          |
| email       | varchar     | User email               |
| avatar_url  | text        | Link to profile picture  |
| status      | user_status | User's current status    |
| created_at  | timestampz  | Account creation time    |

---

## 🏠 servers

Represents community servers.

| Column      | Type        | Description                     |
|-------------|-------------|---------------------------------|
| id          | uuid        | Primary key                     |
| name        | varchar     | Server name                     |
| owner_id    | uuid        | References `users.id`           |
| icon_url    | text        | Server icon                     |
| description | text        | About the server                |
| created_at  | timestampz  | Server creation time            |

---

## 🧑‍🤝‍🧑 server_members

Tracks which users are in which servers.

| Column     | Type        | Description                        |
|------------|-------------|------------------------------------|
| id         | uuid        | Primary key                        |
| server_id  | uuid        | References `servers.id`           |
| user_id    | uuid        | References `users.id`             |
| role       | number_role | Role of the user in the server    |
| joined_at  | timestampz  | When the user joined the server   |

---

## 🗂️ channels

Channels within a server.

| Column     | Type         | Description                       |
|------------|--------------|-----------------------------------|
| id         | uuid         | Primary key                       |
| server_id  | uuid         | References `servers.id`          |
| name       | varchar      | Channel name                      |
| type       | channel_type | Type of channel (e.g. text, voice)|
| created_at | timestampz   | When the channel was created      |

---

## 💬 messages

Messages sent in channels.

| Column      | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | uuid      | Primary key                          |
| channel_id  | uuid      | References `channels.id`            |
| user_id     | uuid      | References `users.id`               |
| content     | text      | Message content                      |
| file_url    | text      | Optional file attachment             |
| reply_to_id | uuid      | References another `messages.id`    |
| created_at  | timestampz| When the message was sent            |

---

## 😊 reactions

Emoji reactions to messages.

| Column     | Type      | Description                        |
|------------|-----------|------------------------------------|
| id         | uuid      | Primary key                        |
| message_id | uuid      | References `messages.id`          |
| user_id    | uuid      | References `users.id`             |
| emoji      | varchar   | Emoji used                         |
| created_at | timestampz| When the reaction was added        |

---

## 📥 direct_messages

One-on-one or group private messages.

| Column         | Type      | Description                            |
|----------------|-----------|----------------------------------------|
| id             | uuid      | Primary key                            |
| conversation_id| uuid      | References `conversations.id`         |
| sender_id      | uuid      | References `users.id`                 |
| receiver_ids   | uuid[]    | Array of recipients                    |
| content        | text      | Message body                           |
| file_url       | text      | Optional file                          |
| created_at     | timestampz| When the DM was sent                   |

---

## 🧵 conversations

Metadata for private message threads.

| Column         | Type       | Description                            |
|----------------|------------|----------------------------------------|
| id             | uuid       | Primary key                            |
| created_at     | timestampz | Conversation creation time             |
| updated_at     | timestampz | Last update                            |
| last_message_at| timestampz | Timestamp of most recent message       |
| is_active      | bool       | Active status                          |
| participants   | uuid[]     | Array of participant user IDs          |

---