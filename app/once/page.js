"use client";
import { useState } from "react";

import styles from "../page.module.css";

export default function Page() {
  const [URL, setURL] = useState("");

  async function receive() {
    console.log(URL);
    
    fetch(`/api/url?url=${URL}`).then((res) =>
      res.json().then((res) => console.log(res.data))
    );
  }

  return (
    <div id={styles.container}>
      <textarea
        className={styles.input_area}
        id={styles.url}
        value={URL}
        onChange={(e) => setURL(e.target.value)}
      ></textarea>

      <div id={styles.inner_container}>
        <div id={styles.input_container}>
          <p>lawNumber</p>
          <textarea
            className={styles.input_area}
            id={styles.lawNumber}
          ></textarea>
          <p>unitPublish</p>
          <textarea
            className={styles.input_area}
            id={styles.unitPublish}
          ></textarea>
          <p>lawKind</p>
          <textarea
            className={styles.input_area}
            id={styles.lawKind}
          ></textarea>
          <p>nameSign</p>
          <textarea
            className={styles.input_area}
            id={styles.nameSign}
          ></textarea>
          <p>lawDaySign</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDaySign}
          ></textarea>
          <p>lawDescription</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDescription}
          ></textarea>
          <p>lawRelated</p>
          <textarea
            className={styles.input_area}
            id={styles.lawRelated}
          ></textarea>
          <p>roleSign</p>
          <textarea
            className={styles.input_area}
            id={styles.roleSign}
          ></textarea>
          <textarea
            className={styles.input_area}
            id={styles.content_input}
          ></textarea>
        </div>
        <div className={{ ...styles.navi_container, ...styles.navi_input }}>
          <button
            type="button"
            className={styles.navi_btb}
            onClick={() => goToStartInput()}
          >
            Go to Start
          </button>

          <button
            type="button"
            className={styles.navi_btb}
            onClick={() => goToEndInput()}
          >
            Go to End
          </button>
        </div>

        <div className={{ ...styles.navi_container, ...styles.navi_output }}>
          <button
            type="button"
            className={styles.navi_btb}
            onClick={() => goToStartOutput()}
          >
            Go to Start
          </button>

          <button
            type="button"
            className={styles.navi_btb}
            onClick={() => goToEndOutput()}
          >
            Go to End
          </button>
        </div>

        <div className={styles.btb_container}>
          <button
            type="button"
            className={styles.btb}
            onClick={() => receive()}
          >
            Receive
          </button>

          <button
            type="button"
            className={styles.btb}
            onClick={() => getInfo()}
          >
            Get Infomation
          </button>
          <button
            className={{ ...styles.btb, ...styles.copy_btb }}
            onClick={() => convertContent()}
          >
            Get Content
          </button>
          <button
            className={{ ...styles.btb, ...styles.delete_btb }}
            onClick={() => Push()}
          >
            Push
          </button>
          <button
            className={{ ...styles.btb, ...styles.naviNext_btb }}
            onClick={() => NaviNext()}
          >
            Next
          </button>
          <button
            className={{ ...styles.btb, ...styles.back_btb }}
            onClick={() => NaviHome()}
          >
            Back
          </button>
        </div>
        <textarea className={styles.output} cols="90"></textarea>
      </div>
    </div>
  );
}
