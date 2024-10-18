/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        lg: { max: '930px' },
        md: { max: '645px' },
        sm: { max: '320px' },
      },
      colors: {
        yellow: '#EDA334',
        darkYellow: '#E1931D',
        lightYellow: '#FBCD8A',
        secondary: '#747775',
        blue: '#1A77F2',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('daisyui')],
};
