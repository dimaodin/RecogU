import "nprogress/nprogress.css";
import React from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <main className="noHighlight">
      <Component {...pageProps} />
    </main>
  );
}
