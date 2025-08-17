-- Create profiles table for Shopify users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_user_id bigint UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  shopify_store_url text NOT NULL,
  shopify_store_name text,
  shopify_access_token text, -- This will be encrypted in the application
  role text DEFAULT 'store_owner' CHECK (role IN ('store_owner', 'store_admin', 'store_staff')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_shopify_user_id ON public.profiles(shopify_user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_shopify_store_url ON public.profiles(shopify_store_url);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (true); -- For now, allow reading all profiles (can be restricted later)

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (true); -- For now, allow updating all profiles (can be restricted later)

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (true); -- For now, allow inserting profiles (can be restricted later)

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;