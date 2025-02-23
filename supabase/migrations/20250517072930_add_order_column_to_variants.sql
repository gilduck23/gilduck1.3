DROP TABLE variants;

    -- Create variants table
    CREATE TABLE variants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid REFERENCES products(id),
      name text NOT NULL,
      image_url text,
      created_at timestamptz DEFAULT now()
    );
