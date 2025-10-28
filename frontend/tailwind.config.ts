/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base colors
        primary: "#0f172a",
        secondary: "#ffffff",

        // Workflow-specific colors
        node: {
          background: "#ffffff",
          border: "#e2e8f0",
          hover: "#f8fafc",
          selected: "#dbeafe",
        },

        // Canvas and workspace
        canvas: "#fafafa", // Main canvas background
        grid: "#f1f5f9", // Grid lines on canvas

        // Port colors (for node connections)
        port: {
          input: "#10b981", // Green for input ports
          output: "#f59e0b", // Orange for output ports
        },

        // Status colors
        success: "#22c55e", // Green for success states
        warning: "#f59e0b", // Orange for warnings
        error: "#ef4444", // Red for errors
        info: "#3b82f6", // Blue for info

        // Enhanced gray scale for better hierarchy
        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f3f4f6",
          150: "#eef0f3",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          850: "#161b22",
          900: "#111827",
          950: "#030712",
        },
      },

      // Spacing for workflow layouts
      spacing: {
        "18": "4.5rem", // Custom spacing for node gaps
        "72": "18rem", // Sidebar width
        "84": "21rem", // Wide sidebar
        "96": "24rem", // Panel widths
      },

      // Border radius for consistent UI
      borderRadius: {
        node: "8px",
        panel: "6px",
        button: "6px",
      },
    },
  },
};
