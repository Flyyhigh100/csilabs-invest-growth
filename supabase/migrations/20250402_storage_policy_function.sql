
-- Function to create storage policies
CREATE OR REPLACE FUNCTION public.create_storage_policy(bucket_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert policy for get operation (authenticated users can download)
  EXECUTE format(
    'CREATE POLICY "Authenticated users can download from %s" ON storage.objects
     FOR SELECT
     TO authenticated
     USING (bucket_id = %L);',
    bucket_name, bucket_name
  );
  
  -- Insert policy for insert operation (authenticated users can upload)
  EXECUTE format(
    'CREATE POLICY "Authenticated users can upload to %s" ON storage.objects
     FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = %L);',
    bucket_name, bucket_name
  );
  
  -- Insert policy for update operation (authenticated users can update their own objects)
  EXECUTE format(
    'CREATE POLICY "Authenticated users can update own objects in %s" ON storage.objects
     FOR UPDATE
     TO authenticated
     USING (bucket_id = %L AND owner = auth.uid());',
    bucket_name, bucket_name
  );
  
  -- Insert policy for delete operation (authenticated users can delete their own objects)
  EXECUTE format(
    'CREATE POLICY "Authenticated users can delete from %s" ON storage.objects
     FOR DELETE
     TO authenticated
     USING (bucket_id = %L AND owner = auth.uid());',
    bucket_name, bucket_name
  );
END;
$$;
