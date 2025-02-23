import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        throw error;
      }

      setCategories(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Category List</h2>
      <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow-md">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-border-light dark:border-border-dark text-left text-xs font-semibold text-text-light dark:text-text-dark uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-border-light dark:border-border-dark text-left text-xs font-semibold text-text-light dark:text-text-dark uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 border-b-2 border-border-light dark:border-border-dark text-left text-xs font-semibold text-text-light dark:text-text-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-5 py-5 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-sm">
                  <p className="text-text-light dark:text-text-dark whitespace-no-wrap">{category.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-sm">
                  <p className="text-text-light dark:text-text-dark">{category.description}</p>
                </td>
                <td className="px-5 py-5 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-sm">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/categories/${category.id}`}
                      className="text-primary-light dark:text-primary-dark hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
