/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
import process from 'process';
import 'dotenv/config'

const getPrimaryColor = () => {
  return process.env.PRIMARY_COLOR || 'ff4d4d';
};

const getPrimarySoftColor = () => {
  return process.env.PRIMARY_SOFT_COLOR || '747775';
};

const getSecondaryColor = () => {
  return process.env.SECONDARY_COLOR || '747775';
};

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
        primary: `#${getPrimaryColor()}`,
        'primary-soft': `#${getPrimarySoftColor()}`,
        secondary: `#${getSecondaryColor()}`,
        dark: '#334155',
        light: '#ffd9d9',
      }, 
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [daisyui,
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
