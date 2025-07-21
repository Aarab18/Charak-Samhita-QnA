module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      tailwindConfig: './tailwind.config.js', // optional if you're using default
    },
    autoprefixer: {},
  },
}