import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import router from "@config/router/AppRouter";
import { QueryProvider } from "./config/providers/QueryProvider";

const App = () => {
  return (
    <>
      <QueryProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            fontSize: "14px",
            fontWeight: "normal",
          }}
          toastStyle={{
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            padding: "12px 16px",
            margin: "4px 0",
          }}
        />
      </QueryProvider>
    </>
  );
};

export default App;
