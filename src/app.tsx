import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Bridge from "./views/bridge";
import WalletsProvider from "./libs/wallets/providers";
import Layout from "./layouts";
import { lazy, useEffect } from "react";
import Developer from "./views/developer";
import ErrorPage from "./views/error";
import { usePrices } from "./hooks/use-prices";
import { sdk } from "@farcaster/miniapp-sdk";
import Terms from "./components/terms";

const History = lazy(() => import("./views/history"));
const LearnMore = lazy(() => import("./views/learn-more"));
const Apply = lazy(() => import("./views/apply"));
const Privacy = lazy(() => import("./views/policy/privacy"));
const TermsOfService = lazy(() => import("./views/policy/terms-of-service"));

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
        path: "apply",
        element: <Apply />
      },
      {
        path: "learn-more",
        element: <LearnMore />
      },
      {
        path: "developer",
        element: <Developer />
      },
      {
        path: "privacy-policy",
        element: <Privacy />
      },
      {
        path: "terms-of-service",
        element: <TermsOfService />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  usePrices();
  useEffect(() => {
    sdk.actions.ready();
  }, []);

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
        {/* <a
          href="https://www.dapdap.net"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[73px] h-[26px] bg-[url('/logo-dapdap.svg')] bg-no-repeat bg-center bg-[length:55px_15px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        /> */}
        <a
          href="https://x.com/0xStableFlow"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[26px] h-[26px] bg-[url('/logo-x.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        />
        <a
          href="https://t.me/stableflowai"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[26px] h-[26px] bg-[url('/logo-telegram.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        />
         <a
          href="https://paragraph.com/@stableflow"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-[26px] h-[26px] bg-[url('/logo-paragraph.svg')] bg-no-repeat bg-center bg-[length:12px_12px] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-[8px] bg-white flex justify-center items-center cursor-pointer grayscale hover:grayscale-0 transition-all duration-300"
        />
      </div>
      <Terms className="fixed z-[11] bottom-[20px] right-[140px]" />
    </WalletsProvider>
  );
}

export default App;
