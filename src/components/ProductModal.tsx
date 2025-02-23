import React, { useState, useEffect } from 'react';
    import { X, Edit, Trash2 } from 'lucide-react';
    import { supabase } from '../lib/supabase';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '../contexts/AuthContext';

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
      const [selectedVariant, setSelectedVariant] = React.useState<Variant | null>(null);
      const [variants, setVariants] = useState<Variant[]>([]);
      const navigate = useNavigate();
      const { user } = useAuth();

      useEffect(() => {
        fetchVariants();
      }, [product.id]);

      async function fetchVariants() {
        const { data } = await supabase
          .from('variants')
          .select('*')
          .eq('product_id', product.id);

        if (data) {
          setVariants(data);
        }
      }

      const handleVariantClick = (variant: Variant) => {
        setSelectedVariant((prevVariant) => {
          return prevVariant?.id === variant.id ? null : variant;
        });
      };

      return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full">
              {/* Image Section */}
              <button onClick={onClose} className="w-1/2 relative">
                <img
                  src={selectedVariant?.image_url || product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>

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

                  {variants && variants.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Available Variants
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {variants.map((variant) => (
                          <div key={variant.id} className="relative">
                            <button
                              onClick={() => handleVariantClick(variant)}
                              className={`w-full p-3 rounded-lg border-2 transition-all ${selectedVariant?.id === variant.id
                                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {variant.name}
                                </p>
                              </div>
                            </button>
                            {user && (
                              <div className="absolute top-1 right-1 flex">
                                <Link
                                  to={`/admin/variants/${variant.id}`}
                                  className="text-primary-light dark:text-primary-dark hover:text-indigo-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVariant(variant.id);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {user && (
                        <Link
                          to="/admin/variants/new"
                          className="block mt-4 text-sm text-primary-light dark:text-primary-dark hover:underline"
                        >
                          Add New Variant
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
