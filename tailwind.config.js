/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'selector', // 'class' is deprecated in favor of 'selector'
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // ... rest of your config
}