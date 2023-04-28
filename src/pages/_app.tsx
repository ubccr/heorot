import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Navbar from "~/components/navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Provider from "~/provider";
import "react-tooltip/dist/react-tooltip.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Provider>
        <div className="min-h-screen bg-large-triangles-ub dark:bg-large-triangles-dark">
          <Navbar />
          <div className="flex justify-center dark:text-white">
            <div className="mt-4 rounded-lg border border-white bg-white p-3 text-center shadow-xl dark:bg-neutral-700">
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </Provider>

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="colored"
      />
    </>
  );
};

export default api.withTRPC(MyApp);
