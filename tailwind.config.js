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
        primary: '#FF0000',
        'primary-soft': '#E94235',
        dark: '#cc0000',
        light: '#FF000026',
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
  }],
  daisyui: {
    themes: [
      {
        light: {
          "base-100": "#F8FBF1", // scrollbar color
        },
        dark: {
          "base-100": "#2B2B2B",
        },
      },
    ],
  },
};
