/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './src/assets/app/**/*.json',
    './src/modules/**/*.json'
  ],
  safelist: [
    'group',
    'filter',
    'animate-pulse',
    'animate-spin',
    'animate-bounce',
    'animate-ping',
    { pattern: /^mat-/, variants: ['hover', 'focus'] },
    { pattern: /^cdk-/, variants: ['hover', 'focus'] },
    { pattern: /^ng-/, variants: ['hover', 'focus'] },
    { pattern: /^swiper-/, variants: ['hover', 'focus'] },
    { pattern: /^aos-/, variants: ['hover', 'focus'] },
  ],
  theme: {
    screens: { sm: '600px', md: '960px', lg: '1280px', xl: '1470px' },
    extend: {
      strokeWidth: { 3: '3', 4: '4', 5: '5' },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '3/4': '3 / 4',
        '1/1': '1 / 1',
        '9/16': '9 / 16',
        '2/3': '2 / 3',
      },
      width: () => ({
        ...generateSizeClasses(100, 700, 100),
      }),
      height: () => ({
        ...generateSizeClasses(100, 700, 100),
      }),
    },
    flex: {
      '1/12': '0 0 8.33%',
      '2/12': '0 0 16.66%',
      '3/12': '0 0 25%',
      '4/12': '0 0 33.33%',
      '5/12': '0 0 41.66%',
      '6/12': '0 0 50%',
      '7/12': '0 0 58.33%',
      '8/12': '0 0 66.66%',
      '9/12': '0 0 75%',
      '10/12': '0 0 83.33%',
      '11/12': '0 0 91.66%',
      '12/12': '0 0 100%',
      1: '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      none: 'none',
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  corePlugins: { preflight: false },
};

function generateSizeClasses(start, end, step, unit = 'px') {
  const classes = {};
  for (let i = start; i <= end; i += step) {
    classes[i] = unit === 'px' ? `${i}${unit}` : `${i / 4}${unit}`;
  }
  return classes;
}
