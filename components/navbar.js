import React from "react";
import Styles from "../styles/navbar.module.css";
import { AiFillApi } from "react-icons/ai";

export default function Sidebar() {
  return (
    <nav className={Styles.side}>
      <div className={Styles.top}>
        <h1>🤖 RECOG.U</h1>
        <span>Mood Diagnosis by a.i</span>
      </div>

      <div className={Styles.bottom}>
        <a
          href="https://github.com/justadudewhohacks/face-api.js/"
          target="_blank"
          rel="noreferrer"
        >
          <AiFillApi />
        </a>
      </div>
    </nav>
  );
}
