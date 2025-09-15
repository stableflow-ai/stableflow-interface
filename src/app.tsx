import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Bridge from "./views/bridge";
import WalletsProvider from "./libs/wallets/providers";
import Layout from "./layouts";
import { lazy } from "react";
import ErrorPage from "./views/error";

const History = lazy(() => import("./views/history"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Bridge />
      },
      {
        path: "history",
        element: <History />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <WalletsProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        theme="light"
        toastStyle={{ backgroundColor: "transparent", boxShadow: "none" }}
        newestOnTop
        rtl={false}
        pauseOnFocusLoss
        closeButton={false}
      />
    </WalletsProvider>
  );
}

export default App;
