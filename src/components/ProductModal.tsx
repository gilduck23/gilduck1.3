import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Variant {
  id: string;
  name: string;
  image_url?: string;
  order: number;
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

function SortableItem(props: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {props.children}
    </div>
  );
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = React.useState<Variant | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  useEffect(() => {
    fetchVariants();
  }, [product.id]);

  async function fetchVariants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', product.id)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching variants:', error);
      }

      if (data) {
        setVariants(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateVariantOrder(newVariants: Variant[]) {
    try {
      const updates = newVariants.map((variant, index) =>
        supabase
          .from('variants')
          .update({ order: index })
          .eq('id', variant.id)
      );

      await Promise.all(updates);
      console.log('Variant order updated successfully');
      await fetchVariants();
    } catch (error) {
      console.error('Error updating variant order:', error);
    }
  }

  const handleVariantClick = (variant: Variant) => {
    setSelectedVariant((prevVariant) => {
      return prevVariant?.id === variant.id ? null : variant;
    });
  };

  const onDragEnd = useCallback(async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = variants.findIndex((variant) => variant.id === active.id);
    const newIndex = variants.findIndex((variant) => variant.id === over.id);

    const newVariants = arrayMove(variants, oldIndex, newIndex);
    setVariants(newVariants);
    await updateVariantOrder(newVariants);
  }, [variants, fetchVariants]);

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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onDragEnd}
                    >
                      <SortableContext
                        items={variants.map(variant => variant.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {variants.map((variant) => (
                            <SortableItem key={variant.id} id={variant.id}>
                              <div className="relative">
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
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {user && (
                      <Link
                        to="/admin/variants/new"
                        className="block mt-4 text-sm text-primary-light dark:text-primary-dark hover:underline"
                      >
                        Add New Variant
                      </Link>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
