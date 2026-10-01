"use client";

import { useState, useRef, useEffect } from "react";
// import {getValueinArea} from '../../public/asset/'
import styles from "../page.module.css";
import { useSearchParams } from "next/navigation";
import {
  addDaysToDate,
  getRoleSign,
  getArrangeUnitPublic,
  getLawDayActive,
  getLawRelated,
  RemoveNoOrder,
  convertPartOne,
  convertPartTwo,
  convertPartOneOfficialDispatch,
  convertPartTwoOfficialDispatch,
  convertBareTextInfo,
  getNormalTextInfo,
  convertContent,
  convertContentOfficialDispatch,
  convertAppendix,
  beep,
  Push,
} from "../main";

export default function Page() {
  const [URL, setURL] = useState("");
  const [lawNumberText, setLawNumber] = useState("");
  const [unitPublishText, setUnitPublish] = useState("");
  const [lawKindText, setLawKind] = useState("");
  const [nameSignText, setNameSign] = useState("");
  const [lawDaySignText, setLawDaySign] = useState("");
  const [lawDescriptionText, setLawDescription] = useState("");
  const [roleSignText, setRoleSign] = useState("");
  const [lawRelatedText, setLawRelated] = useState("");
  const [contentInputText, setContentInput] = useState("");
  const [tables, setTables] = useState([]); // bảng trong nội dung (lib/lawTables.js)
  const [appendix, setAppendix] = useState([]); // phụ lục sau chữ ký (lib/lawAppendix.js)
  // sửa tại chỗ 1 phụ lục (tên / nội dung) — có hiệu lực khi convert lại
  const updateAppendix = (i, patch) =>
    setAppendix((list) => list.map((a, k) => (k === i ? { ...a, ...patch } : a)));
  const removeAppendix = (i) =>
    setAppendix((list) => list.filter((_, k) => k !== i));
  const [contentOutputText, setContentOutput] = useState("");
  const [lawInfoPush, setLawInfoPush] = useState({});
  const [lawNameDisplayText, setLawNameDisplayText] = useState("");
  const [lawDayActiveText, setLawDayActive] = useState("");

  const [fullText, setFullText] = useState("");
  const [textForMachine, setTextForMachine] = useState({});
  const [isPushing, setIsPushing] = useState(false);

  const inputArea = useRef(null);
  const outputArea = useRef(null);
  const lawRelatedRef = useRef(null);

  const searchParams = useSearchParams();
  const url = searchParams.get("URL");

  const [ObjectLawPair, setObjectLawPair] = useState({});

  useEffect(() => {
    fetch("/api/getlawjson", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setObjectLawPair(data))
      .catch((err) => console.error("Fetch JSON error:", err));
  }, []);

  useEffect(() => {
    if (url) {
      setURL(url);
      setTimeout(() => {
        receive();
      }, 500);
    }
  }, []);

  async function receive() {
    fetch(`/api/url?url=${url ? url : URL}`).then((res) =>
      res.json().then((res) => {
        // console.log(res.data)

        setLawNumber(res.data.lawNumber);
        setUnitPublish(res.data.unitPublish);
        setLawKind(res.data.lawKind);
        setNameSign(res.data.nameSign);
        setLawDaySign(res.data.lawDaySign);
        setLawDescription(res.data.lawDescription);
        setLawRelated(res.data.lawRelated);
        setRoleSign(res.data.roleSign);
        setTables(res.data.tables || []);
        setAppendix(res.data.appendix || []);
        setContentInput(res.data.content);
      }),
    );
  }

  let lawInfo = {};
  let contentText = "";

  let roleSign = [];

  let lawDayActive;
  let unitPublishString;
  let unitPublish;
  let lawDaySign;
  let nameSignString;
  let nameSignArrayDemo;
  let nameSign;
  let lawDescription;
  let lawNumber;
  let lawRelated;
  let lawKind;
  let lawNameDisplay;

  function getValueinArea() {
    lawKind = lawKindText.replace(/(^\s*|\s*$)/gim, "");

    // Cơ quan/Bộ và người ký được phân tách bằng dấu "," (một số VB cũ dùng ";").
    // Ngoại trừ tên Bộ có sẵn dấu phẩy bên trong (vd "Bộ Văn hóa, Thể thao và
    // Du lịch") — bảo vệ để không bị cắt nhầm giữa tên. Thêm Bộ khác vào PROTECTED.
    const splitUnitOrName = (text) => {
      const PROTECTED = [/Bộ Văn hóa, Thể thao và Du lịch/gi];
      const PLACEHOLDER = "__COMMA__";
      let t = text;
      PROTECTED.forEach((re) => {
        t = t.replace(re, (m) => m.replace(/,/g, PLACEHOLDER));
      });
      return t
        .split(/[,;]/)
        .map((item) => item.replace(new RegExp(PLACEHOLDER, "g"), ",").trim())
        .filter(Boolean);
    };

    unitPublish = splitUnitOrName(unitPublishText);
    lawDaySign = lawDaySignText.replace(/\s/gim, "");

    nameSign = splitUnitOrName(nameSignText);

    lawDescription = lawDescriptionText;

    lawNumber = lawNumberText.replace(/\s/gim, "");

    lawRelated = [];

    // console.log('lawDescription',lawDescription);
    lawNameDisplay = lawDescription;
    if (lawKind.match(/^(luật|bộ luật)/i)) {
      lawNameDisplay = lawDescription.replace(/,* của Quốc hội.*số.*/i, "");
      // lawNameDisplay = lawNameDisplay.replace(/,* số \d.*của Quốc hội.*/i, "");
      // lawNameDisplay = lawNameDisplay.replace(
      //   /,* số \d.*(của Quốc hội)*.*/i,
      //   ""
      // );

      lawNameDisplay =
        lawKind + " " + lawNameDisplay + " năm " + lawDaySign.match(/\d+$/i)[0];
    } else if (
      lawKind.match(/hợp nhất$/gim) &&
      lawNameDisplay.match(/(Bộ )*Luật.*/gim)
    ) {
      lawNameDisplay =
        lawNameDisplay.match(/(Bộ )*Luật.*/gim)[0] +
        " hợp nhất năm " +
        lawDaySign.match(/\d+$/i)[0];
    } else {
      lawNameDisplay = lawKind + " số " + lawNumber;
    }

    contentText = contentInputText;
    contentText = contentText.replace(/(^\s*|\s*$)/gim, ""); // bỏ các khoảng trắng đầu và cuối nếu có
  }

  async function getInfo() {
    try {
      getValueinArea();
      let result;
      // let dataLaw

      // console.log('roleSignText',roleSignText);
      if (roleSignText && lawRelatedText) {
        result = await getNormalTextInfo(
          contentText,
          roleSignText,
          lawRelatedText,
          lawNumber,
          nameSign,
          ObjectLawPair,
          lawDaySign,
          lawNameDisplay,
          lawDescription,
          lawKind,
          unitPublish,
        );
        setContentOutput(result.partTwo);
      } else {
        result = await convertBareTextInfo(
          contentInputText,
          lawRelatedText,
          lawNumber,
          nameSign,
          lawKind,
          unitPublish,
          ObjectLawPair,
          lawDaySign,
          lawNameDisplay,
          lawDescription,
        );
        // console.log('infoLaw',result);
        setContentOutput(result.partTwo);
      }
      setLawInfoPush(result.lawInfo);

      const daySign = result.lawInfo["lawDaySign"];
      setLawDaySign(
        daySign instanceof Date && !isNaN(daySign)
          ? daySign.toISOString()
          : (daySign ?? ""),
      );

      let yearSign = parseInt(result.lawInfo["lawDaySign"].getYear()) + 1900;
      let lawNumberForPush =
        result.lawInfo["lawNumber"] +
        (!result.lawInfo["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
          ? "(" + yearSign + ")"
          : "");

      if (lawNumberForPush in ObjectLawPair) {
        alert("đã có rồi");
      }

      // console.log(lawNameDisplay);

      setLawDescription(result.lawInfo["lawDescription"]);
      setLawNameDisplayText(
        result.lawInfo["lawKind"].match(/luật/gim)
          ? lawNameDisplay
          : result.lawInfo["lawNameDisplay"],
      );

      const dayActive = result.lawInfo["lawDayActive"];
      setLawDayActive(
        dayActive instanceof Date && !isNaN(dayActive)
          ? dayActive.toISOString()
          : (dayActive ?? ""),
      );
    } catch (e) {
      beep();
      console.log(e);
    }
  }

  async function clickToConvertContent(contentOutputText) {
    console.log("lawDayActive", lawInfoPush.lawDayActive);
    console.log("lawDaySign", lawInfoPush.lawDaySign);
    console.log("lawKind", lawInfoPush.lawKind);
    console.log("lawNumber", lawInfoPush.lawNumber);
    console.log("lawNameDisplay", lawInfoPush.lawNameDisplay);
    console.log("lawDescription", lawInfoPush.lawDescription);
    console.log("unitPublish", lawInfoPush.unitPublish);
    console.log("nameSign", lawInfoPush.nameSign);
    console.log("roleSign", lawInfoPush.roleSign);
    console.log("lawRelated", lawInfoPush.lawRelated);

    let result;
    !lawInfoPush["lawNumber"].match(/\d+\/(TT|NĐ|QH|UBTVQH|VBHN-LQ)/gim)
      ? (result = convertContentOfficialDispatch(contentOutputText))
      : (result = convertContent(contentOutputText));

    // phụ lục (quy chế, danh mục…) nối vào CUỐI content (lib/lawAppendix.js)
    const extra = Array.isArray(result.data)
      ? convertAppendix(appendix)
      : { items: [], text: "" };
    setFullText(
      extra.text ? result.fullText + "\n" + extra.text : result.fullText,
    );
    setTextForMachine(
      extra.items.length ? [...result.data, ...extra.items] : result.data,
    );
  }

  async function handlePush() {
    if (isPushing) return;
    if (!textForMachine) {
      alert("Chưa chuyển đổi nội dung");
      return;
    }
    setIsPushing(true);
    try {
      await Push(textForMachine, lawInfoPush, fullText, false, tables);
    } catch (e) {
      beep();
      console.log(e);
    } finally {
      setIsPushing(false);
    }
  }

  useEffect(() => {
    setLawInfoPush({
      ...lawInfoPush,
      lawDescription: lawDescriptionText,
      lawNameDisplay: lawNameDisplayText,
      lawKind: lawKindText,
      lawNumber: lawNumberText,
      lawDayActive: lawDayActiveText ? new Date(lawDayActiveText) : null,
      lawDaySign: lawDaySignText ? new Date(lawDaySignText) : null,
    });

    if (Object.keys(lawInfoPush).length > 0) {
    }
  }, [
    lawDescriptionText,
    lawNameDisplayText,
    lawDaySignText,
    lawKindText,
    lawNumberText,
    lawDayActiveText,
    lawDaySignText,
  ]);

  function goToStartInput() {
    window.scrollTo({
      top: 0,
    });
  }

  function goToEndInput() {
    window.scrollTo({
      top: document.body.scrollHeight,
    });
  }

  function goToStartOutput() {
    window.scrollTo({
      top: 0,
    });
  }

  function goToEndOutput() {
    window.scrollTo({ top: outputArea.current.scrollHeight - 300 });
  }

  async function copyContent() {
    setLawNumber("");
    setUnitPublish("");
    setLawKind("");
    setNameSign("");
    setLawDaySign("");
    setLawDescription("");
    setRoleSign("");
    setLawRelated("");
    setContentInput("");
    setTables([]);
    setAppendix([]);
    setContentOutput("");

    const clipText = await navigator.clipboard.readText();
    setURL(clipText);
  }

  return (
    <div id={styles.container}>
      <style>{`
        @keyframes push-spin { to { transform: rotate(360deg); } }
        .push-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 6px;
          vertical-align: -2px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: push-spin 0.7s linear infinite;
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <button style={{ width: "5%" }} onClick={() => copyContent()}>
          Copy
        </button>
        <textarea
          className={styles.input_area}
          style={{
            height: 35,
            backgroundColor: "white",
            color: "black",
            width: "95%",
            paddingLeft: 5,
          }}
          id={styles.url}
          value={URL}
          onChange={(e) => setURL(e.target.value)}
        ></textarea>
      </div>
      <div
        id={styles.inner_container}
        style={{ display: "flex", flexDirection: "row", width: "77%" }}
      >
        <div id={styles.input_container}>
          <p>lawNumber</p>
          <textarea
            className={styles.input_area}
            id={styles.lawNumber}
            value={lawNumberText}
            onChange={(e) => setLawNumber(e.target.value)}
          ></textarea>
          <p>unitPublish</p>
          <textarea
            className={styles.input_area}
            id={styles.unitPublish}
            value={unitPublishText}
            onChange={(e) => setUnitPublish(e.target.value)}
          ></textarea>
          <p>lawKind</p>
          <textarea
            className={styles.input_area}
            id={styles.lawKind}
            value={lawKindText}
            onChange={(e) => setLawKind(e.target.value)}
          ></textarea>
          <p>nameSign</p>
          <textarea
            className={styles.input_area}
            id={styles.nameSign}
            value={nameSignText}
            onChange={(e) => setNameSign(e.target.value)}
          ></textarea>
          <p>LawDaySign</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDaySign}
            value={lawDaySignText}
            onChange={(e) => setLawDaySign(e.target.value)}
          ></textarea>
          <p>lawDayActive</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDayActive}
            value={lawDayActiveText}
            onChange={(e) => setLawDayActive(e.target.value)}
          ></textarea>
          <p>LawNameDisplay</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDaySign}
            value={lawNameDisplayText}
            onChange={(e) => setLawNameDisplayText(e.target.value)}
          ></textarea>
          <p>lawDescription</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDescription}
            value={lawDescriptionText}
            onChange={(e) => setLawDescription(e.target.value)}
            ref={lawRelatedRef}
          ></textarea>
          <p>lawRelated</p>
          <textarea
            className={styles.input_area}
            id={styles.lawRelated}
            value={lawRelatedText}
            onChange={(e) => setLawRelated(e.target.value)}
          ></textarea>
          <p>roleSign</p>
          <textarea
            className={styles.input_area}
            id={styles.roleSign}
            value={roleSignText}
            onChange={(e) => setRoleSign(e.target.value)}
          ></textarea>
          <p>Content</p>
          <textarea
            className={styles.input_area}
            id={styles.content_input}
            value={contentInputText}
            onChange={(e) => setContentInput(e.target.value)}
            ref={inputArea}
          ></textarea>
        </div>
        <div className={styles.navi_container} style={{ left: 460 }}>
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

        <div className={styles.navi_container} style={{ right: 53 }}>
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
            style={{ backgroundColor: "orange", marginBottom: 40 }}
            onClick={() => receive()}
          >
            Receive
          </button>

          <button
            type="button"
            className={styles.btb}
            style={{ color: "black" }}
            onClick={() => getInfo()}
          >
            Get Infomation
          </button>
          <button
            className={styles.btb}
            style={{ backgroundColor: "forestgreen" }}
            onClick={() => clickToConvertContent(contentOutputText)}
          >
            Get Content
          </button>
          <button
            className={styles.btb}
            style={{
              backgroundColor: "red",
              opacity: isPushing ? 0.7 : 1,
              cursor: isPushing ? "not-allowed" : "pointer",
            }}
            disabled={isPushing}
            onClick={() => handlePush()}
          >
            {isPushing ? (
              <>
                <span className="push-spinner" />
                Pushing...
              </>
            ) : (
              "Push"
            )}
          </button>
          {/* <button
            className={styles.btb}
            style={{backgroundColor:'rgb(255, 123, 0)'}}
            onClick={() => NaviNext()}
          >
            Next
          </button>
          <button
            className={styles.btb}
            style={{backgroundColor:'black',color:'white'}}
            onClick={() => NaviHome()}
          >
            Back
          </button> */}
        </div>
        <div className={styles.output_container}>
          <p>Output</p>
          <textarea
            className={styles.output}
            value={contentOutputText}
            onChange={(e) => setContentOutput(e.target.value)}
            ref={outputArea}
          ></textarea>
          <div style={{ marginTop: 12 }}>
            <p>
              Phụ lục / quy chế ({appendix.length}) — nối vào cuối nội dung khi
              convert. Sửa xong phải bấm convert lại.
            </p>
            {appendix.map((a, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ flex: 1 }}
                    value={a.title}
                    placeholder="Tên phụ lục"
                    onChange={(e) => updateAppendix(i, { title: e.target.value })}
                  />
                  <button onClick={() => removeAppendix(i)}>Xóa</button>
                </div>
                <textarea
                  style={{ width: "99%", height: 400 }}
                  value={a.text}
                  onChange={(e) => updateAppendix(i, { text: e.target.value })}
                ></textarea>
              </div>
            ))}
            <button
              onClick={() =>
                setAppendix([...appendix, { title: "Phụ lục", text: "" }])
              }
            >
              + Thêm phụ lục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}