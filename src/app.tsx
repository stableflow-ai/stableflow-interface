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
const Overview = lazy(() => import("./views/overview"));
const LearnMore = lazy(() => import("./views/learn-more"));

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
      },
      {
        path: "overview",
        element: <Overview />
      },
      {
        path: "learn-more",
        element: <LearnMore />
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
      <div className="fixed z-[11] bottom-[10px] left-[15px] flex items-center gap-[8px]">
        <a
          href="https://www.dapdap.net"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[73px] h-[26px] bg-[url('/logo-dapdap.svg')] bg-no-repeat bg-center bg-[length:55px_15px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        />
        <a
          href="https://x.com/0xStableFlow"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[26px] h-[26px] bg-[url('/logo-x.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        />
        <a
          href="/learn-more"
          className="h-[26px] px-[12px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[#0E3616] hover:text-white transition-all duration-300 text-[12px] font-[500] text-[#2B3337]"
        >
          Learn More
        </a>
      </div>
    </WalletsProvider>
  );
}

export default App;
