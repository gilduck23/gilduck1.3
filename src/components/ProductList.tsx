import React, { useEffect, useState } from 'react';
    import { supabase } from '../lib/supabase';
    import { Edit, Trash2, Search, Filter } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import ProductModal from './ProductModal';

    interface Product {
      id: string;
      name: string;
      description: string;
      image_url: string;
      category: {
        name: string;
      };
      variants: {
        id: string;
        name: string;
        image_url: string;
      }[];
    }

    export default function ProductList({ isAdmin = false }) {
      const [products, setProducts] = useState<Product[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState<string>('all');
      const [categories, setCategories] = useState<{ name: string }[]>([]);
      const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
      const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
      const [currentPage, setCurrentPage] = useState(1);
      const [productsPerPage, setProductsPerPage] = useState(getProductsPerPage());

      // Function to determine products per page based on screen width
      function getProductsPerPage() {
        const width = window.innerWidth;
        return width < 768 ? 12 : 32; // Mobile: 12, Desktop: 32
      }

      useEffect(() => {
        // Update products per page on window resize
        const handleResize = () => {
          setProductsPerPage(getProductsPerPage());
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

      useEffect(() => {
        fetchCategories();
        fetchProducts();
      }, []);

      useEffect(() => {
        applyFilters();
      }, [products, searchTerm, selectedCategory]);

      useEffect(() => {
        // Scroll to top when currentPage changes
        window.scrollTo(0, 0);
      }, [currentPage]);

      const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('name');
        if (data) setCategories(data);
      };

      const fetchProducts = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(name),
              variants(id, name, image_url)
            `);

          if (error) {
            console.error('Supabase error:', error);
            setError(error.message);
            throw error;
          }

          // Remove duplicate variants for each product
          const productsWithUniqueVariants = data.map(product => ({
            ...product,
            variants: removeDuplicateVariants(product.variants),
          }));

          setProducts(productsWithUniqueVariants);
          setError(null);
        } catch (error) {
          console.error('Error fetching products:', error);
          setError('Failed to load products. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      // Function to remove duplicate variants
      const removeDuplicateVariants = (variants: any[]) => {
        const uniqueVariants = [];
        const variantMap = new Map(); // Use a Map for efficient lookups

        for (const variant of variants) {
          const key = `${variant.name}-${variant.image_url}`; // Create a unique key

          if (!variantMap.has(key)) {
            uniqueVariants.push(variant);
            variantMap.set(key, true); // Mark this variant as seen
          }
        }

        return uniqueVariants;
      };

      const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
          // Delete variants associated with the product first
          const { error: deleteVariantsError } = await supabase
            .from('variants')
            .delete()
            .eq('product_id', id);

          if (deleteVariantsError) {
            console.error('Error deleting variants:', deleteVariantsError);
            setError('Failed to delete variants. Please try again.');
            return;
          }

          // Then delete the product
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting product:', error);
            setError('Failed to delete product. Please try again.');
            return;
          }

          // Refresh products
          fetchProducts();
        } catch (error) {
          console.error('Error deleting product:', error);
          setError('Failed to delete product. Please try again later.');
        }
      };

      const applyFilters = () => {
        let filtered = [...products];

        if (selectedCategory !== 'all') {
          filtered = filtered.filter(product => product.category?.name === selectedCategory);
        }

        if (searchTerm) {
          filtered = filtered.filter(product =>
            (typeof product.name === 'string' && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (typeof product.description === 'string' && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setFilteredProducts(filtered);
      };

      const indexOfLastProduct = currentPage * productsPerPage;
      const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
      const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

      const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
      };

      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(filteredProducts.length / productsPerPage); i++) {
        pageNumbers.push(i);
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/products/new"
                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    Add New Product
                  </Link>
                )}
              </div>
            </div>
          </div>

          {currentProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No products found matching your criteria.</p>
              <p className="text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                          {product.category && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.category.name}</p>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {product.variants && product.variants.length > 0 && (
                        <div className="pt-2">
                          <div className="flex flex-wrap gap-2">
                            {product.variants.slice(0, 2).map((variant) => (
                              <span
                                key={variant.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              >
                                {variant.name}
                              </span>
                            ))}
                            {product.variants.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                +{product.variants.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <nav className="flex justify-center mt-8">
                <ul className="flex space-x-2">
                  {pageNumbers.map(number => (
                    <li key={number}>
                      <button
                        onClick={() => paginate(number)}
                        className={`px-4 py-2 rounded-md ${currentPage === number ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          )}

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </div>
      );
    }
