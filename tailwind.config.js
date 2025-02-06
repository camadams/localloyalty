/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./<custom-folder>/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'nativewind/babel',
  ],
}

