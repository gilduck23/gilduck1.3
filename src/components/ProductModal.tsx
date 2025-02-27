    import React, { useState, useEffect, useCallback } from 'react';
    import { X, Edit, Trash2 } from 'lucide-react';
    import { supabase } from '../lib/supabase';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';
    import { useTheme } from '../contexts/ThemeContext';

    interface Variant {
      id: string;
      name: string;
      image_url?: string;
    }

    interface Product {
      id: string;
      name: string;
      description: string;
      image_url: string;
      category: {
        name: string;
      };
      variants: Variant[];
    }

    interface ProductModalProps {
      product: Product;
      onClose: () => void;
    }

    export default function ProductModal({ product, onClose }: ProductModalProps) {
      const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
      const [variants, setVariants] = useState<Variant[]>([]);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const { user } = useAuth();
      const { theme } = useTheme();
      const [isImageZoomed, setIsImageZoomed] = useState(false);
      const [zoomedImageUrl, setZoomedImageUrl] = useState('');

      useEffect(() => {
        fetchVariants();
      }, [product.id]);

      const fetchVariants = useCallback(async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('variants')
            .select('*')
            .eq('product_id', product.id);

          if (error) {
            console.error('Error fetching variants:', error);
          }

          if (data) {
            // Remove duplicate variants
            const uniqueVariants = data.reduce((acc: Variant[], current: Variant) => {
              const x = acc.find(item => item.name === current.name && item.image_url === current.image_url);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);

            // Sort variants alphabetically by name
            const sortedVariants = [...uniqueVariants].sort((a, b) => a.name.localeCompare(b.name));
            setVariants(sortedVariants);
          }
        } finally {
          setLoading(false);
        }
      }, [product.id]);

      const handleVariantChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const variantId = event.target.value;
        const selected = variants.find(v => v.id === variantId) || null;
        setSelectedVariant(selected);
      }, [variants]);

      const handleAddVariantClick = () => {
        navigate('/admin/variants/new', { state: { product_id: product.id } });
      };

      const handleImageClick = () => {
        const imageUrl = selectedVariant?.image_url || product.image_url || '';
        setZoomedImageUrl(imageUrl);
        setIsImageZoomed(true);
      };

      const handleCloseZoom = () => {
        setIsImageZoomed(false);
        setZoomedImageUrl('');
      };

      const handleDeleteVariant = async (variantId: string) => {
        if (!window.confirm('Are you sure you want to delete this variant?')) return;

        try {
          const { error } = await supabase
            .from('variants')
            .delete()
            .eq('id', variantId);

          if (error) {
            console.error('Error deleting variant:', error);
            alert('Failed to delete variant.');
          } else {
            // Refresh variants after deletion
            fetchVariants();
          }
        } catch (error) {
          console.error('Error deleting variant:', error);
          alert('Failed to delete variant.');
        }
      };

      // Define theme-aware CSS classes
      const selectClasses = `w-full p-3 rounded-lg border-2 ${theme === 'dark'
        ? 'border-gray-700 hover:border-gray-600 bg-gray-800 text-white'
        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
        }`;

      return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full">
              {/* Image Section */}
              <div className="w-1/2 relative">
                <button onClick={handleImageClick} className="w-full h-full">
                  <img
                    src={selectedVariant?.image_url || product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-zoom-in"
                  />
                </button>
              </div>

              {/* Content Section */}
              <div className="w-1/2 p-8 relative flex flex-col">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex-1 overflow-y-auto">
                  <div className="mb-6">
                    {product.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 mb-2">
                        {product.category.name}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {product.description}
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white"></div>
                    </div>
                  ) : (
                    variants && variants.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Available Variants
                        </h3>
                        <select
                          value={selectedVariant?.id || ''}
                          onChange={handleVariantChange}
                          className={selectClasses}
                        >
                          <option value="">Select a variant</option>
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                        {user && (
                          <div className="mt-4 flex justify-between items-center">
                            <button
                              onClick={handleAddVariantClick}
                              className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                            >
                              Add New Variant
                            </button>
                            {selectedVariant && (
                              <div className="flex space-x-2">
                                <Link
                                  to={`/admin/variants/${selectedVariant.id}`}
                                  className="text-primary-light dark:text-primary-dark hover:text-indigo-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVariant(selectedVariant.id);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Image Zoom Overlay */}
          {isImageZoomed && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleCloseZoom}>
              <img
                src={zoomedImageUrl}
                alt="Zoomed Image"
                className="max-w-full max-h-full object-contain cursor-zoom-out"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleCloseZoom}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          )}
        </div>
      );
    }
