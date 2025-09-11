import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Bridge from "./views/bridge";
import WalletsProvider from "./libs/wallets/providers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Bridge />
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
