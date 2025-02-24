import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import VariantForm from './VariantForm';
import ProductList from './ProductList';
import CategoryList from './CategoryList';
import ProductImport from './ProductImport';

export default function AdminPanel() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-bg-light dark:bg-bg-dark">
        <Routes>
          <Route path="/" element={<ProductList isAdmin />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/import" element={<ProductImport />} />
          <Route path="/products/:id" element={<ProductForm />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/:id" element={<CategoryForm />} />
          <Route path="/variants/new" element={<VariantForm />} />
          <Route path="/variants/:id" element={<VariantForm />} />
        </Routes>
      </div>
    </div>
  );
}
