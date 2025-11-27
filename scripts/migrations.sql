-- scripts/migrations.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- seed AI system user (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email='ai@chatvista.local') THEN
    INSERT INTO users(id, username, email, password, profile_image, bio)
    VALUES ('00000000-0000-0000-0000-000000000001', 'ChatVista AI', 'ai@chatvista.local', 'system', NULL, 'System AI account');
  END IF;
END
$$;

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

-- messages
CREATE TYPE IF NOT EXISTS message_status AS ENUM ('sent', 'delivered', 'read');

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  status message_status DEFAULT 'sent'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
