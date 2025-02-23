import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, LogIn, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-card-light dark:bg-card-dark shadow-lg transition-colors border-b border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary-light dark:text-primary-dark" />
            <span className="text-xl font-bold text-text-light dark:text-text-dark">Product Catalog</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/admin" className="hover:text-primary-light dark:hover:text-primary-dark text-text-light dark:text-text-dark">
                  Admin Panel
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 hover:text-primary-light dark:hover:text-primary-dark text-text-light dark:text-text-dark"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center space-x-1 hover:text-primary-light dark:hover:text-primary-dark text-text-light dark:text-text-dark"
              >
                <LogIn className="h-5 w-5" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
