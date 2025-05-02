/**  @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6600',
        secondary: '#000000',
        light: '#FFFFFF',
        gray: {
          100: '#f7f7f7',
          200: '#e6e6e6',
          300: '#d5d5d5',
          400: '#b4b4b4',
          500: '#939393',
          600: '#6e6e6e',
          700: '#4a4a4a',
          800: '#262626',
          900: '#121212',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1650954316166-c3361fefcc87?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwZW5naW5lZXJpbmclMjBibGFjayUyMG9yYW5nZSUyMHRvb2xzJTIwbWFjaGluZXJ5fGVufDB8fHx8MTc0NjEzOTMyMnww&ixlib=rb-4.0.3')",
      }
    },
  },
  plugins: [],
};
 