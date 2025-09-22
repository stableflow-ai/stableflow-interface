import { OKXUniversalProvider } from "@okxconnect/universal-provider";
import { useDebounceFn } from "ahooks";
import { createContext, useContext, useEffect, useState } from "react";

const OKXConnectContext = createContext<any>(null);

const OKXConnectProvider = (props: any) => {
  const { children } = props;

  const [okxUniversalProvider, setOKXUniversalProvider] = useState<OKXUniversalProvider | null>(null);
  const [updated, setUpdated] = useState(1);

  const initOKXUniversalProvider = async () => {
    const _okxUniversalProvider = await OKXUniversalProvider.init({
      dappMetaData: {
        name: "application name",
        icon: "application icon url"
      },
    });
    setOKXUniversalProvider(_okxUniversalProvider);
  };

  useEffect(() => {
    initOKXUniversalProvider();
  }, []);

  const connect = async () => {
    const session = await okxUniversalProvider?.connect({
      namespaces: {
        solana: {
          chains: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
        },
        tron: {
          chains: [
            "tron:mainnet",
          ],
        }
      },
      sessionConfig: {
        // do not specify redirect url, it maybe open the current URL in the different browser
        // redirect: "https://next-rainbowkit-demo.vercel.app"
      }
    });
    console.log("connected session: %o", session);
    setUpdated((prev) => prev + 1);
  };

  const disconnect = async () => {
    okxUniversalProvider?.disconnect();
    setUpdated((prev) => prev + 1);
  };

  return (
    <OKXConnectContext.Provider
      value={{
        connect,
        disconnect,
        updated,
        okxUniversalProvider,
        icon: "https://web3.okx.com/cdn/assets/imgs/254/2056DB8D2D22F68E.png",
      }}
    >
      {children}
    </OKXConnectContext.Provider>
  );

};

export default OKXConnectProvider;

export const useOKXConnect = () => {
  return useContext(OKXConnectContext);
};

export const useWatchOKXConnect = (provider: any) => {
  const okxConnect = useOKXConnect();
  const { okxUniversalProvider, updated } = okxConnect;

  const { run: connect2OKX } = useDebounceFn(() => {
    if (!okxUniversalProvider) return;

    provider(okxConnect);
  }, { wait: 500 });

  useEffect(() => {
    connect2OKX();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        connect2OKX();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [okxUniversalProvider, updated]);
};


