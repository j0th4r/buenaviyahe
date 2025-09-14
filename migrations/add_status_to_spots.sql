-- Add status column to spots table
ALTER TABLE spots 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add submitted_at timestamp if not exists (for tracking when spots were submitted)
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index on status for faster queries
CREATE INDEX idx_spots_status ON spots(status);

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

