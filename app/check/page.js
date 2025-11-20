"use client";
import { useState } from "react";
import styles from "../page.module.css";

function Page() {
  const [URL, setURL] = useState("");
  const [data, setData] = useState({});
  // console.log("data", data);

  async function check() {
    console.log(URL);

    let a = await fetch(`/api/check?url=` + encodeURIComponent(URL))
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

  async function checkNghiDinh() {
    
    setURL(
      "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=ngh%E1%BB%8B&search=&search=&DocTypeIds=11&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
    );
    let a = await fetch(
      `/api/check?url=` +
        encodeURIComponent(
          "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=ngh%E1%BB%8B&search=&search=&DocTypeIds=11&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
        )
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

  async function checkThongTu() {
    setURL(
      "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=&search=&DocTypeIds=21&DocTypeIds=22&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
    );
    let a = await fetch(
      `/api/check?url=` +
        encodeURIComponent(
          "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=&search=&DocTypeIds=21&DocTypeIds=22&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
        )
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

  async function checkVanBanHopNhat() {
    setURL(
      "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=v%C4%83&search=v%C4%83n%20ph%C3%B2ng%20q&search=&DocTypeIds=59&OrganIds=325&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
    );
    let a = await fetch(
      `/api/check?url=` +
        encodeURIComponent(
          "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=v%C4%83&search=v%C4%83n%20ph%C3%B2ng%20q&search=&DocTypeIds=59&OrganIds=325&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
        )
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

    async function checkNghiQuyet() {
    setURL(
      "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=ngh%E1%BB%8B%20quy%E1%BA%BFt%20h%E1%BB%99i%20%C4%91%E1%BB%93ng%20th%E1%BA%A9m%20ph%C3%A1n&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=&search=&DocTypeIds=0&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
    );
    let a = await fetch(
      `/api/check?url=` +
        encodeURIComponent(
          "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=ngh%E1%BB%8B%20quy%E1%BA%BFt%20h%E1%BB%99i%20%C4%91%E1%BB%93ng%20th%E1%BA%A9m%20ph%C3%A1n&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=&search=&search=&DocTypeIds=0&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=200&PageIndex=1"
        )
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

    async function checkLuat() {
    setURL(
      "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=lu%E1%BA%ADt&search=&search=&DocTypeIds=58&DocTypeIds=10&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=100&PageIndex=1"
    );
    let a = await fetch(
      `/api/check?url=` +
        encodeURIComponent(
          "https://luatvietnam.vn/van-ban/tim-van-ban.html?keywords=&SearchOptions=1&SearchByDate=issueDate&DateFromString=01/01/2025&DateToString=&search=lu%E1%BA%ADt&search=&search=&DocTypeIds=58&DocTypeIds=10&OrganIds=0&FieldIds=0&LanguageId=0&SignerIds=0&SignerIds=0&RowAmount=100&PageIndex=1"
        )
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res.content);
        // console.log("res.data", res.content);
      });
  }

  return (
    <div id={styles.container}>
      <div id={styles.inner_container}>
        <div id={styles.input_container}>
          <textarea
            className={styles.input_area}
            id={styles.content_input}
            value={URL}
            onChange={(e) => setURL(e.target.value)}
            style={{ width: 500 ,marginTop:20}}
            cols={100}
            onKeyDown={(e) => {
              
              if (e.key === "Enter" && !e.shiftKey) {
                 e.preventDefault(); 
                check();
              }
            }}
          ></textarea>
          <div>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => check()}
            >
              Check
            </button>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => checkNghiDinh()}
            >
              Check Nghị Định
            </button>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => checkThongTu()}
            >
              Check Thông Tư
            </button>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => checkVanBanHopNhat()}
            >
              Check Văn bản hợp nhất
            </button>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => checkNghiQuyet()}
            >
              Check Nghị quyết
            </button>
            <button
              style={{
                width: "20%",
                marginTop: 10,
                marginRight: 20,
                height: 30,
              }}
              onClick={() => checkLuat()}
            >
              Check Luật
            </button>
          </div>
          <table style={{ paddingTop: 10 }}>
            <tbody>
              <tr>
                <td
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    borderStyle: "solid",
                    padding: 5,
                  }}
                >
                  STT
                </td>
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
                          textAlign: "center",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          borderWidth: 1,
                          borderColor: "white",
                          borderStyle: "solid",
                          padding: 10,
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
                      <td
                        style={{
                          borderWidth: 1,
                          borderColor: "white",
                          borderStyle: "solid",
                          backgroundColor: "#4CAF50",
                        }}
                      >
                        <a
                          href={`/once?URL=${data[key]}`}
                          target="_blank"
                          style={{ justifyContent: "center", display: "flex" }}
                        >
                          Redirect
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Page;
