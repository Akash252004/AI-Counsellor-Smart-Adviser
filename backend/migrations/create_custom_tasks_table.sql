-- Create custom_tasks table for user-created tasks
CREATE TABLE IF NOT EXISTS custom_tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT DEFAULT 'general', -- general, exam, application, document
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_custom_tasks_user_id ON custom_tasks(user_id);
CREATE INDEX idx_custom_tasks_due_date ON custom_tasks(due_date);

-- Enable RLS
ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
ON custom_tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own tasks
CREATE POLICY "Users can create their own tasks"
ON custom_tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
ON custom_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON custom_tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
