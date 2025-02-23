/*
      # Product Catalog Schema

      1. New Tables
        - categories
          - id (uuid, primary key)
          - name (text)
          - description (text)
          - created_at (timestamp)

        - products
          - id (uuid, primary key)
          - name (text)
          - description (text)
          - price (numeric)
          - category_id (uuid, foreign key)
          - image_url (text)
          - created_at (timestamp)

        - variants
          - id (uuid, primary key)
          - product_id (uuid, foreign key)
          - name (text)
          - image_url (text)
          - created_at (timestamp)

      2. Security
        - Enable RLS on all tables
        - Add policies for authenticated admin users to manage data
        - Allow public read access for products, categories, and variants
    */

    -- Create categories table
    CREATE TABLE categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      created_at timestamptz DEFAULT now()
    );

    -- Create products table
    CREATE TABLE products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      price numeric NOT NULL,
      category_id uuid REFERENCES categories(id),
      image_url text,
      created_at timestamptz DEFAULT now()
    );

    -- Create variants table
    CREATE TABLE variants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid REFERENCES products(id),
      name text NOT NULL,
      image_url text,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE variants ENABLE ROW LEVEL SECURITY;

    -- Public read access policies
    CREATE POLICY "Allow public read access on categories"
      ON categories FOR SELECT
      TO PUBLIC
      USING (true);

    CREATE POLICY "Allow public read access on products"
      ON products FOR SELECT
      TO PUBLIC
      USING (true);

    CREATE POLICY "Allow public read access on variants"
      ON variants FOR SELECT
      TO PUBLIC
      USING (true);

    -- Admin access policies for categories
    CREATE POLICY "Allow admin full access to categories"
      ON categories
      FOR ALL
      TO authenticated
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');

    -- Admin access policies for products
    CREATE POLICY "Allow admin full access to products"
      ON products
      FOR ALL
      TO authenticated
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');

    -- Admin access policies for variants
    CREATE POLICY "Allow admin full access to variants"
      ON variants
      FOR ALL
      TO authenticated
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
