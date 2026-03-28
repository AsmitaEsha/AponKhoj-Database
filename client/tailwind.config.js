/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FDFBF7',
                primary: {
                    light: '#2E6652',
                    DEFAULT: '#1B4332',
                    dark: '#0C2219',
                },
                secondary: {
                    light: '#FF7D42',
                    DEFAULT: '#E8530A',
                    dark: '#B03A00',
                },
                accent: {
                    teal: '#0D6E6E',
                    red: '#C62828',
                }
            },
            fontFamily: {
                sans: ['"Noto Sans Bengali"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
