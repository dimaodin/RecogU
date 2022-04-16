import Router from "next/router";
import Styles from "../styles/index.module.css";

export default function Button({ text, url, isNewTab, Svg, refBtn }) {
  function openUrl() {
    if (!url) {
      return false;
    }

    if (isNewTab) {
      window.open(url, "_blank");
    } else {
      Router.push(url);
    }
  }

  return (
    <button className={Styles.button} onClick={() => openUrl()} ref={refBtn}>
      {Svg ? Svg : ""}
      {text}
    </button>
  );
}
