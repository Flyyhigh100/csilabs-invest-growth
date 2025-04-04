
-- Make sure the kyc_status enum has 'needs_clarification' value
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type 
                   JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
                   WHERE pg_type.typname = 'kyc_status' 
                   AND pg_enum.enumlabel = 'needs_clarification') THEN
        ALTER TYPE public.kyc_status ADD VALUE 'needs_clarification' IF NOT EXISTS;
    END IF;
END $$;

-- Create policy to allow admins to access kyc_verifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kyc_verifications' 
        AND policyname = 'Admin can manage all KYC verifications'
    ) THEN
        CREATE POLICY "Admin can manage all KYC verifications" ON public.kyc_verifications
        FOR ALL TO authenticated
        USING (is_admin() = true)
        WITH CHECK (is_admin() = true);
    END IF;
END $$;

-- Create policy to allow admins to access admins table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admins' 
        AND policyname = 'Admin can manage all admin records'
    ) THEN
        CREATE POLICY "Admin can manage all admin records" ON public.admins
        FOR ALL TO authenticated
        USING (is_admin() = true)
        WITH CHECK (is_admin() = true);
    END IF;
END $$;

-- Users can see their own KYC verification
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kyc_verifications' 
        AND policyname = 'Users can see their own KYC verification'
    ) THEN
        CREATE POLICY "Users can see their own KYC verification" ON public.kyc_verifications
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;
