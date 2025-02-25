import React, { useState, useEffect } from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { Package, FolderPlus, Layers, List, Upload } from 'lucide-react';
    import { supabase } from '../lib/supabase';

    export default function AdminSidebar() {
      const location = useLocation();
      const [productCount, setProductCount] = useState(0);

      useEffect(() => {
        fetchProductCount();
      }, []);

      const fetchProductCount = async () => {
        try {
          const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

          if (error) {
            console.error('Error fetching product count:', error);
          }

          if (count !== null) {
            setProductCount(count);
          }
        } catch (error) {
          console.error('Error fetching product count:', error);
        }
      };

      const isActive = (path: string) => {
        return location.pathname.startsWith(path);
      };

      return (
        <div className="w-64 bg-card-light dark:bg-card-dark shadow-lg h-screen p-4 border-r border-border-light dark:border-border-dark">
          <h2 className="text-xl font-bold mb-6 text-text-light dark:text-text-dark">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              to="/admin/"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark ${isActive('/admin') && location.pathname === '/admin' ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <Package className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Products ({productCount})</span>
            </Link>
            <Link
              to="/admin/products/new"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark ${isActive('/admin/products/new') ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <Package className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Add Product</span>
            </Link>
            <Link
              to="/admin/products/import"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark ${isActive('/admin/products/import') ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <Upload className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Import Products</span>
            </Link>
            <Link
              to="/admin/categories"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark ${isActive('/admin/categories') ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <List className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Categories</span>
            </Link>
            <Link
              to="/admin/categories/new"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark ${isActive('/admin/categories/new') ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <FolderPlus className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Add Category</span>
            </Link>
            <Link
              to="/admin/variants/new"
              className={`flex items-center space-x-2 p-2 rounded hover:bg-secondary-light dark:hover:bg-secondary-dark  ${isActive('/admin/variants/new') ? 'bg-secondary-light text-primary-light dark:bg-secondary-dark dark:text-primary-dark' : 'text-text-light dark:text-text-dark'
                }`}
            >
              <Layers className="h-5 w-5" />
              <span className="text-text-light dark:text-text-dark">Add Variant</span>
            </Link>
          </nav>
        </div>
      );
    }
