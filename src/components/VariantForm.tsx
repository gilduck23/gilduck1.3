import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function VariantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    price_adjustment: 0,
    stock: 0,
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchVariant();
    }
  }, [id]);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  }

  async function fetchVariant() {
    if (id) {
      const { data } = await supabase
        .from('variants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setFormData({
          product_id: data.product_id,
          name: data.name,
          price_adjustment: data.price_adjustment,
          stock: data.stock,
          image_url: data.image_url || ''
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = id
      ? await supabase
          .from('variants')
          .update(formData)
          .eq('id', id)
      : await supabase
          .from('variants')
          .insert([formData]);

    if (!error) {
      navigate('/admin');
    } else {
      console.error("Error submitting form:", error);
      alert("Failed to save variant. See console for details.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-card-light dark:bg-card-dark p-8 rounded-lg shadow-md border border-border-light dark:border-border-dark">
      <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">
        {id ? 'Edit Variant' : 'Add New Variant'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-light dark:text-text-dark">Product</label>
          <select
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            className="mt-1 block w-full rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
            required
          >
            <option value="">Select a product</option>
            {products.map((product: any) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light dark:text-text-dark">Variant Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light dark:text-text-dark">Price Adjustment</label>
          <input
            type="number"
            value={formData.price_adjustment}
            onChange={(e) => setFormData({ ...formData, price_adjustment: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light dark:text-text-dark">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light dark:text-text-dark">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="mt-1 block w-full rounded-md border border-border-light dark:border-border-dark shadow-sm focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
            placeholder="https://example.com/image.jpg"
          />
          {formData.image_url && (
            <div className="mt-2">
              <img
                src={formData.image_url}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          >
            {id ? 'Update Variant' : 'Add Variant'}
          </button>
        </div>
      </form>
    </div>
  );
}
