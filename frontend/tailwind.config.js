/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // AMOLED black and dark tones
                'true-black': '#000000',
                'deep-black': '#0a0a0a',
                'soft-black': '#1a1a1a',

                // Soft blue/cyan palette (Ghibli-inspired)
                'sky-blue': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                'soft-cyan': {
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                },

                // Muted accents
                'muted-blue': '#4a5568',
                'glow-blue': 'rgba(125, 211, 252, 0.3)',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                rounded: ['Outfit', 'Quicksand', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.8' }],
                'sm': ['0.875rem', { lineHeight: '1.8' }],
                'base': ['1rem', { lineHeight: '1.8' }],
                'lg': ['1.125rem', { lineHeight: '1.8' }],
                'xl': ['1.25rem', { lineHeight: '1.8' }],
                '2xl': ['1.5rem', { lineHeight: '1.8' }],
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(125, 211, 252, 0.3)',
                'glow-md': '0 0 20px rgba(125, 211, 252, 0.4)',
                'glow-lg': '0 0 30px rgba(125, 211, 252, 0.5)',
                'soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out',
                'slide-up': 'slideUp 0.8s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
                'breathe': 'breathe 4s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseSlow: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
                breathe: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                    '50%': { transform: 'scale(1.05)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(125, 211, 252, 0.3)' },
                    '50%': { boxShadow: '0 0 20px rgba(125, 211, 252, 0.6)' },
                },
            },
            transitionDuration: {
                '2000': '2000ms',
                '3000': '3000ms',
            },
        },
    },
    plugins: [],
}
