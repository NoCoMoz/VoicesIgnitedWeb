import React from "react";
import Header from "@/components/Header/Header";
import "@/styles/globals.css";
import "@/styles/pages/events.styles.scss";
import type { AppProps } from "next/app";
import Head from "next/head";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="VI" />
        <link rel="manifest" href="/site.webmanifest" />{" "}
      </Head>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default MyApp;
