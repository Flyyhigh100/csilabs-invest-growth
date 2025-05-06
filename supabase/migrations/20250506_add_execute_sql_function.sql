
-- Create a function to execute SQL queries with admin privileges
-- This allows us to run direct SQL for more complex queries where relationships might be problematic
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the user has admin privileges
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Permission denied: Admin privileges required';
  END IF;

  -- Execute the query and return the results as JSON
  RETURN QUERY EXECUTE sql_query;
END;
$$;

-- Grant execute permissions to authenticated users
-- The is_admin check inside the function will still prevent non-admin use
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
