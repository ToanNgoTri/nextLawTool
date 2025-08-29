"use client";
import { useState } from "react";
import styles from "../page.module.css";
// export const metadata = {
//   title: "Check",
// };

function Page() {
  const [URL, setURL] = useState("");
  const [data, setData] = useState({});
  console.log("data", data);

  async function check() {
    // console.log(URL);

    let a = await fetch(`/api/check?url=` + encodeURIComponent(URL))
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        console.log("res.data", res.content);
      });
  }

  return (
    <div id={styles.container}>
      <div id={styles.inner_container}>
        <div id={styles.input_container}>
          <span style={{ marginBottom: 40 }}>Tìm phần tử còn thiếu </span>

          <textarea
            className={styles.input_area}
            id={styles.content_input}
            value={URL}
            onChange={(e) => setURL(e.target.value)}
            style={{ width: 500 }}
            cols={100}
          ></textarea>

          <button
            style={{ width: "20%", marginTop: 10 }}
            onClick={() => check()}
          >
            Check
          </button>

          <table style={{ paddingTop: 10 }}>
            <tbody>
              <tr>
                <td
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    borderStyle: "solid",
                  }}
                >
                  Tên
                </td>
                <td
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    borderStyle: "solid",
                  }}
                >
                  URL
                </td>
                <td
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    borderStyle: "solid",
                  }}
                >
                  Chuyển
                </td>
              </tr>

              {data &&
                Object.keys(data).map((key, i) => {
                  return (
                    <tr key={i}>
                      <td
                        style={{
                          borderWidth: 1,
                          borderColor: "white",
                          borderStyle: "solid",
                        }}
                      >
                        {key}
                      </td>
                      <td
                        style={{
                          borderWidth: 1,
                          borderColor: "white",
                          borderStyle: "solid",
                        }}
                      >
                        {data[key]}
                      </td>
                      <td style={{
                          borderWidth: 1,
                          borderColor: "white",
                          borderStyle: "solid",
                        }}>
                      <a href={`/once?URL=${data[key]}`} target="_blank">
                        Redirect
                      </a>

                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* <form className={styles.input_part__container} action="/check" method="get">
            <div
              style="
                padding: 15px;
                border: 1px solid black;
                text-align: center;
                justify-self: center;
                cursor: pointer;
              "
            >
              URL
            </div>

            <input
              type="text"
              placeholder="Check URL..."
              class="input_part__container_input"
              value="<%= URL %>"
              name="URL"
            />
            <button style="width: 20%" type="submit">Next</button>
          </form> */}
        </div>
      </div>
    </div>
  );
}

export default Page;
