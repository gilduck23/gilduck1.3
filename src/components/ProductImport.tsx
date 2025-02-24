import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export default function ProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [importing, setImporting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setError('No data found in the file.');
          setImporting(false);
          return;
        }

        // Process data and insert into Supabase
        await processAndInsertData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error('Error importing data:', err);
      setError(`Failed to import products: ${err.message}`);
      setImporting(false);
    }
  };

  const processAndInsertData = async (jsonData: any[]) => {
    try {
      // Group variants by product
      const productsMap: { [key: string]: any } = {};

      jsonData.forEach((item) => {
        const productId = item.product_id || item.name; // Use product_id if available, otherwise use product name
        if (!productsMap[productId]) {
          productsMap[productId] = {
            name: item.name,
            category: item.category || 'edit',
            image_url: item.image_url,
            price: item.price || 10,
            variants: [],
          };
        }

        // Add variant to the product
        if (item.variant_name) {
          productsMap[productId].variants.push({
            name: item.variant_name,
            image_url: item.variant_image_url,
          });
        }
      });

      const totalProducts = Object.keys(productsMap).length;
      let processedProducts = 0;

      // Insert products and variants into Supabase
      for (const productId in productsMap) {
        const product = productsMap[productId];

        // Fetch category ID by name
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .single();

        if (categoryError) {
          console.error('Supabase error (category):', categoryError);
          setError(`Failed to find category ${product.category}: ${categoryError.message}`);
          setImporting(false);
          return;
        }

        if (!categoryData) {
          setError(`Category "${product.category}" not found.`);
          setImporting(false);
          return;
        }

        // Check if product already exists
        const { data: existingProduct, error: existingProductError } = await supabase
          .from('products')
          .select('id')
          .eq('name', product.name)
          .single();

        let product_id: string;

        if (existingProductError && existingProductError.code !== 'PGRST116') {
          console.error('Supabase error (checking existing product):', existingProductError);
          setError(`Failed to check existing product ${product.name}: ${existingProductError.message}`);
          setImporting(false);
          return;
        }

        if (existingProduct) {
          // Product already exists, use its ID
          product_id = existingProduct.id;
        } else {
          // Insert product
          const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([{
              name: product.name,
              category_id: categoryData.id,
              image_url: product.image_url,
              price: product.price,
            }])
            .select();

          if (productError) {
            console.error('Supabase error (product):', productError);
            setError(`Failed to import product ${product.name}: ${productError.message}`);
            setImporting(false);
            return;
          }

          product_id = productData[0].id;
        }

        // Insert variants
        const variantsToInsert = product.variants.map((variant: any) => ({
          product_id: product_id,
          name: variant.name,
          image_url: variant.image_url,
        }));

        const { data: variantsData, error: variantsError } = await supabase
          .from('variants')
          .insert(variantsToInsert)
          .select();

        if (variantsError) {
          console.error('Supabase error (variants):', variantsError);
          setError(`Failed to import variants for product ${product.name}: ${variantsError.message}`);
          setImporting(false);
          return;
        }

        processedProducts++;
        const currentProgress = Math.round((processedProducts / totalProducts) * 100);
        setProgress(currentProgress);
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Error processing and inserting data:', error);
      setError(`Failed to import products: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <h2 className="text-2xl font-bold mb-6 text-center text-text-light dark:text-text-dark">Import Products from XLSX</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Products imported successfully!
          </div>
        )}

        <div className="mb-4">
          <label className="block text-text-light dark:text-text-dark text-sm font-bold mb-2">
            Select XLSX File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <button
          onClick={handleImport}
          className="w-full bg-primary-light dark:bg-primary-dark text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2"
          disabled={importing}
        >
          Import
        </button>

        {importing && (
          <div className="mt-4">
            <label className="block text-text-light dark:text-text-dark text-sm font-bold mb-2">
              Importing... {progress}%
            </label>
            <progress value={progress} max="100" className="w-full"></progress>
          </div>
        )}
      </div>
    </div>
  );
}
