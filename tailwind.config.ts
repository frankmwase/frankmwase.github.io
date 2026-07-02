import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Malawi-inspired warm palette
        terracotta: {
          50: '#fef5f0',
          100: '#fde8dc',
          200: '#faccb3',
          300: '#f6a880',
          400: '#f07d4a',
          500: '#C85A3A',
          600: '#b44a2c',
          700: '#963a22',
          800: '#7a3120',
          900: '#652b1f',
        },
        teal: {
          50: '#edfcfc',
          100: '#d2f5f6',
          200: '#aaebed',
          300: '#70dade',
          400: '#36c0c8',
          500: '#1a9fab',
          600: '#177f8e',
          700: '#1A4F5C',
          800: '#1c4b55',
          900: '#1c3f48',
        },
        midnight: {
          50: '#f5f7fa',
          100: '#eaecf2',
          200: '#d0d6e2',
          300: '#a7b2c8',
          400: '#7889aa',
          500: '#576b90',
          600: '#455578',
          700: '#394562',
          800: '#1a1f2e',
          900: '#0f1219',
          950: '#090b10',
        },
        gold: {
          400: '#f0c040',
          500: '#d4a828',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typewriter': 'typewriter 3.5s steps(40, end)',
        'blink': 'blink 0.75s step-end infinite',
        'mesh-rotate': 'meshRotate 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 90, 58, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 90, 58, 0.6)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: 'currentColor' },
        },
        meshRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #0f1219 0%, #1a1f2e 25%, #1A4F5C 50%, #1a1f2e 75%, #0f1219 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
