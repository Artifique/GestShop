-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'manager');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile_money', 'transfer');

-- 2. TABLES

-- Profiles (Link to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'manager' NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    total_spent DECIMAL(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    seller_id UUID REFERENCES profiles(id) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    shop_name TEXT NOT NULL DEFAULT 'GestShop',
    contact_email TEXT,
    currency TEXT DEFAULT 'EUR',
    timezone TEXT DEFAULT 'UTC+1',
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT one_row CHECK (id = 1)
);

-- 3. RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Simple version: authenticated users can do everything for now)
-- In production, you should refine these based on roles.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable all for authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON sale_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- 5. INITIAL DATA (Admin profile will be created via Supabase Auth)
INSERT INTO settings (id, shop_name, contact_email, currency, timezone)
VALUES (1, 'GestShop Boutique', 'contact@gestshop.com', 'EUR', 'UTC+1')
ON CONFLICT (id) DO NOTHING;
