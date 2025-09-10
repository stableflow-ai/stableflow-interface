import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Bridge from "./views/bridge";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Bridge />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
