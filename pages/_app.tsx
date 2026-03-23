import "antd/dist/reset.css";
import "../styles/globals.css";
import { useState, useEffect, createContext } from "react";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
// import { SessionProvider } from "next-auth/react"
import { AppProvider } from "../context/AppContext";
import { SWRConfig } from "swr";
import Head from "next/head";
import axios from "axios";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import duration from "dayjs/plugin/duration";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isSameOrAfter);
dayjs.extend(duration);
dayjs.extend(isoWeek);

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const SWRCtx = createContext({
  revalidateIfStale: false,
  revalidateOnMount: false,
});

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // return <Component {...pageProps} />
  const getLayout = Component.getLayout ?? ((page) => page);

  if (typeof window !== "undefined") {
    window.onload = () => {
      document.getElementById("holderStyle")!.remove();
    };
  }
  return (
    <SWRCtx.Provider
      value={{
        revalidateIfStale: false,
        revalidateOnMount: false,
      }}
    >
      <SWRConfig value={{ fetcher: (url) => axios(url).then((r) => r.data) }}>
        <Head>
          <style
            id="holderStyle"
            dangerouslySetInnerHTML={{
              __html: `
                    *, *::before, *::after {
                        transition: none!important;
                    }
                    `,
            }}
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <title>Nano Nano One Piece - Dashboard</title>
        </Head>
        <div style={{ visibility: !mounted ? "hidden" : "visible" }}>
          <AppProvider>{getLayout(<Component {...pageProps} />)}</AppProvider>
        </div>
      </SWRConfig>
    </SWRCtx.Provider>
  );
}

export default MyApp;
