/** @type {import('tailwindcss').Config} */
    export default {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            'primary-light': '#4f46e5',
            'primary-dark': '#c7d2fe',
            'secondary-light': '#ede9fe',
            'secondary-dark': '#3730a3',
            'text-light': '#374151',
            'text-dark': '#d1d5db',
            'bg-light': '#f9fafb',
            'bg-dark': '#1f2937',
            'card-light': '#ffffff',
            'card-dark': '#374151',
            'border-light': '#d1d5db',
            'border-dark': '#4b5563',
          },
        },
      },
      plugins: [],
    };
