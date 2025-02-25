import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Variant {
  id: string;
  name: string;
  price: number; // ✅ Tambahkan harga untuk tiap varian
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
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    fetchVariants();
  }, [product.id]);

  // ✅ Mengoptimalkan pengambilan data dari Supabase
  const fetchVariants = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', product.id);

      if (error) throw error;

      if (data) {
        const uniqueVariants = data.reduce((acc: Variant[], current: Variant) => {
          if (!acc.find(item => item.name === current.name && item.image_url === current.image_url)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setVariants(uniqueVariants);
        setSelectedVariant(uniqueVariants[0]); // ✅ Pilih varian pertama sebagai default
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  // ✅ Fungsi untuk menangani klik varian
  const handleVariantClick = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  const handleImageClick = () => {
    setIsImageZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsImageZoomed(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full">
          
          {/* ✅ Image Section */}
          <div className="w-1/2 relative">
            <button onClick={handleImageClick} className="w-full h-full">
              <img
                src={selectedVariant?.image_url || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </button>
          </div>

          {/* ✅ Content Section */}
          <div className="w-1/2 p-8 relative flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="mb-6">
                {product.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 mb-2">
                    {product.category.name}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white"></div>
                </div>
              ) : (
                variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pilih Varian</h3>
                    
                    {/* ✅ Grid Varian */}
                    <div className="grid grid-cols-2 gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantClick(variant)}
                          className={`w-full p-3 rounded-lg border-2 transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{variant.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Rp{variant.price.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* ✅ Tombol Beli */}
              {selectedVariant && (
                <div className="mt-4">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg">
                    Beli Rp{selectedVariant.price.toLocaleString()}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Image Zoom */}
      {isImageZoomed && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleCloseZoom}>
          <img src={selectedVariant?.image_url || product.image_url} alt="Zoomed Image" className="max-w-full max-h-full object-contain cursor-zoom-out" />
          <button onClick={handleCloseZoom} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
