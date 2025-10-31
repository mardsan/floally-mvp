-- Create standup_status table for tracking daily focus status
-- Run this in Railway's PostgreSQL console

CREATE TABLE IF NOT EXISTS standup_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Task details
    task_title VARCHAR(500) NOT NULL,
    task_description TEXT,
    task_project VARCHAR(255),
    urgency INTEGER DEFAULT 50,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- AI context
    ai_reasoning TEXT,
    secondary_priorities JSONB,
    daily_plan JSONB,
    
    -- Metadata
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_standup_status_user_date ON standup_status(user_id, date);

-- Verify table was created
SELECT 
    'standup_status table created successfully!' as message,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'standup_status';
