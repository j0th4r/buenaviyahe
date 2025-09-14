# Migration Instructions: Add Status to Spots Table

To make the spot approvals functionality work, you need to run the following migration on your Supabase database:

## 1. Go to Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor

## 2. Run the Migration

Copy and paste the following SQL script and execute it:

```sql
-- Add status column to spots table
ALTER TABLE spots
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add submitted_at timestamp if not exists (for tracking when spots were submitted)
ALTER TABLE spots
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);

-- Update existing spots to be approved by default (since they're already live)
UPDATE spots SET status = 'approved' WHERE status = 'pending';

-- Add RLS policies for status updates
-- Only admins can update spot status
CREATE POLICY "Only admins can update spot status" ON spots
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## 3. Verify the Migration

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'spots'
AND column_name IN ('status', 'submitted_at');
```

## 4. Test the Functionality

1. Go to your admin dashboard at `/admin/spot-approvals`
2. You should now be able to approve or reject spots
3. The status will be updated in the database

## What This Does

- Adds a `status` column to track whether spots are pending, approved, or rejected
- Adds a `submitted_at` timestamp to track when spots were submitted
- Creates an index for better performance when filtering by status
- Sets all existing spots to 'approved' (since they're already live)
- Adds Row Level Security (RLS) to ensure only admins can update spot status

