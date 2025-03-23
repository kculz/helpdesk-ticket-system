/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Use Inter as the default font
      },
      colors: {
        primary: "#4F46E5", // Indigo-600
        secondary: "#6366F1", // Indigo-500
        accent: "#EC4899", // Pink-500
        background: "#F9FAFB", // Gray-100
        foreground: "#1F2937", // Gray-800
        card: "#FFFFFF",
        border: "#E5E7EB", // Gray-200
      },
      boxShadow: {
        soft: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        medium: "0px 6px 12px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
