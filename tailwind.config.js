/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        lg: { max: '930px' },
        md: { max: '645px' },
        sm: { max: '490px' },
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
  plugins: [require('daisyui'),
  ({ addBase, theme }) => {
    addBase({
      ':root': {
        '--screen-lg-max': theme('screens.lg.max'),
        '--screen-md-max': theme('screens.md.max'),
        '--screen-sm-max': theme('screens.sm.max'),
      },
    });
  }
  ],
};
