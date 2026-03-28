DROP TABLE IF EXISTS api_usage_logs;
DROP TABLE IF EXISTS call_transcripts;
DROP TABLE IF EXISTS call_requests;
DROP TABLE IF EXISTS users;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(10) DEFAULT 'user',
  api_call_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP
);

-- CALL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS call_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  goal TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  outcome_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  CONSTRAINT fk_call_requests_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- CALL TRANSCRIPTS TABLE
CREATE TABLE IF NOT EXISTS call_transcripts (
  id SERIAL PRIMARY KEY,
  call_request_id INTEGER NOT NULL,
  speaker VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_call_transcripts_call_requests
    FOREIGN KEY (call_request_id)
    REFERENCES call_requests(id)
    ON DELETE CASCADE
);

-- API USAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_api_usage_logs_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
