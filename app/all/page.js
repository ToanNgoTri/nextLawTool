"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
// import {getValueinArea} from '../../public/asset/'
import styles from "../page.module.css";
import { useSearchParams, useParams, usePathname } from "next/navigation";
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
  beep,
  Push,
} from "../main";

// export const metadata = {
//   title: "All",
// };

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
  const [contentOutputText, setContentOutput] = useState("");
  const [lawInfoPush, setLawInfoPush] = useState({});
  const [lawNameDisplayText, setLawNameDisplayText] = useState("");
  const [lawDayActiveText, setLawDayActive] = useState("");

  const [fullText, setFullText] = useState("");
  const [textForMachine, setTextForMachine] = useState({});

  const inputArea = useRef(null);
  const outputArea = useRef(null);
  const lawRelatedRef = useRef(null);
  // Đánh dấu "vừa Receive xong" để getInfo chỉ tự chạy 1 lần sau khi cào,
  // KHÔNG chạy lại mỗi lần gõ/sửa tay trong ô Content.
  const receivedRef = useRef(false);

  const searchParams = useSearchParams();
  const url = searchParams.get("URL");
  const id = searchParams.get("id");

  const [ObjectLawPair, setObjectLawPair] = useState({});

  useEffect(() => {
    fetch("/api/getlawjson", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setObjectLawPair(data))
      .catch((err) => console.error("Fetch JSON error:", err));
  }, []);
  useEffect(() => {
    document.title = "Văn bản số 123"; // đặt title tùy ý

    if (url) {
      getAllURL();
    }
  }, [url]);

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

    lawNameDisplay = lawDescription;
    if (lawKind.match(/^(luật|bộ luật)/i)) {
      lawNameDisplay = lawDescription.replace(/,* của Quốc hội.*số.*/i, "");
      lawNameDisplay = lawNameDisplay.replace(
        /,* số \d.*(của Quốc hội)*.*/i,
        "",
      );

      lawNameDisplay = lawNameDisplay + " năm " + lawDaySign.match(/\d+$/i)[0];
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

  async function getInfo(isManual = false) {
    try {
      getValueinArea();
      let result;

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
        setContentOutput(result.partTwo);
      }

      let yearSign = parseInt(result.lawInfo["lawDaySign"].getYear()) + 1900;
      let lawNumberForPush =
        result.lawInfo["lawNumber"] +
        (!result.lawInfo["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
          ? "(" + yearSign + ")"
          : "");

      // Luồng TỰ ĐỘNG: đã có trong DB thì bỏ qua. Bấm tay "Get Infomation"
      // (isManual) thì VẪN xử lý để test/push lại dù đã có trong DB.
      if (lawNumberForPush in ObjectLawPair) {
        if (!isManual) {
          console.log("Luật đã có trong DB => bỏ qua:", lawNumberForPush);
          return;
        }
        console.log("Luật đã có trong DB (vẫn xử lý vì bấm tay):", lawNumberForPush);
      }

      // Chưa có trong DB => tiến hành đẩy dữ liệu
      setLawInfoPush(result.lawInfo);

      // Tự điền các ô hiển thị như /once
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

      console.log("lawDescription", result.lawInfo["lawDescription"]);
      console.log("lawNumber", result.lawInfo["lawNumber"]);
      console.log("lawKind", result.lawInfo["lawKind"]);
      console.log("lawDaySign", result.lawInfo["lawDaySign"]);
      console.log("lawDayActive", result.lawInfo["lawDayActive"]);
      console.log("lawNameDisplay", result.lawInfo["lawNameDisplay"]);
      console.log("lawRelated", result.lawInfo["lawRelated"]);
      console.log("unitPublish", result.lawInfo["unitPublish"]);
      console.log("nameSign", result.lawInfo["nameSign"]);
      console.log("roleSign", result.lawInfo["roleSign"]);
    } catch (e) {
      beep();
      console.log("Lỗi getInfo => bỏ qua (không tự nhảy tiếp):", e);
    }
  }
  useEffect(() => {
    // Chỉ tự xử lý sau khi bấm "Receive" (cào xong). Gõ/sửa tay ô Content
    // KHÔNG kích hoạt — muốn xử lý lại thì bấm "Get Infomation".
    if (contentInputText && receivedRef.current) {
      receivedRef.current = false;
      getInfo();
    }
  }, [contentInputText, lawKindText]);

  useEffect(() => {
    if (Object.keys(lawInfoPush).length) {
      clickToConvertContent(contentOutputText);
    }
  }, [lawInfoPush]);

  // Đã tắt tự động Push và tự động chuyển trang (NaviNext).
  // Dùng nút "Push" và nút "Next" để thao tác thủ công.
  // useEffect(() => {
  //   if (Object.keys(textForMachine).length) {
  //     setTimeout(() => {
  //       Push(textForMachine, lawInfoPush, fullText, true)
  //         .then((res) => {
  //           console.log(res);
  //
  //           // Push xong (thành công hay thất bại) đều nhảy tiếp
  //           setTimeout(() => {
  //             NaviNext();
  //           }, 3000);
  //         })
  //         .catch((e) => {
  //           console.log("Lỗi Push => bỏ qua, nhảy tiếp:", e);
  //           NaviNext();
  //         });
  //     }, 1000);
  //   }
  // }, [textForMachine]);

  async function clickToConvertContent(contentOutputText) {
    try {
      if (!lawInfoPush || !lawInfoPush["lawNumber"]) {
        console.log("Chưa có lawInfoPush — bấm 'Get Infomation' trước.");
        return;
      }
      let result;
      lawInfoPush["lawNumber"].match(/^\d+\/(TAND|VKS).+\-/gim)
        ? (result = convertContentOfficialDispatch(contentOutputText))
        : (result = convertContent(contentOutputText));

      setFullText(result.fullText);
      setTextForMachine(result.data);
    } catch (e) {
      beep();
      console.log("Lỗi convert content => bỏ qua (không tự nhảy tiếp):", e);
    }
  }

  function getAllURL() {
    console.log(url);

    fetch(`/api/AllURL?id=${id}&URL=` + encodeURIComponent(url)).then((res) =>
      res.json().then((res) => {
        setLawNumber(res.data.lawNumber);
        setUnitPublish(res.data.unitPublish);
        setLawKind(res.data.lawKind);
        setNameSign(res.data.nameSign);
        setLawDaySign(res.data.lawDaySign);
        setLawDescription(res.data.lawDescription);
        setLawRelated(res.data.lawRelated);
        setRoleSign(res.data.roleSign);
        receivedRef.current = true; // cho phép getInfo tự chạy 1 lần
        setContentInput(res.data.content);
      }),
    );
  }

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
    setContentOutput("");

    const clipText = await navigator.clipboard.readText();
    setURL(clipText);
  }

  function NaviNext() {
    console.log("url", url);

    let URI = url;
    console.log("URI", URI);

    if (!URI.match(/PageIndex=/)) {
      console.log("có");

      URI = `/all?id=${id}&URL=${encodeURIComponent(
        url + "&RowAmount=100&PageIndex=1",
      )}`;
    } else {
      URI = `/all?id=${id}&URL=${encodeURIComponent(url)}`;
    }

    let currentIndex = id;
    let nextURI;

    console.log("URI", URI);

    if (currentIndex > 0) {
      nextURI = URI.replace(
        new RegExp(`all\\?id=${id}`, "g"),
        `all?id=${Number(id) + -1}`,
      );
    } else if (
      currentIndex == 0 &&
      parseInt(URI.match(/(?<=\%26PageIndex\%3D).*/gim)[0] == 1)
    ) {
      return;
    } else {
      console.log(2);

      let nextPage = parseInt(URI.match(/(?<=\%26PageIndex\%3D).*/gim)[0]) - 1;
      console.log(nextPage);

      nextURI = URI.replace(/(?<=\%26PageIndex\%3D).*/gim, nextPage);
      nextURI = nextURI.replace(new RegExp(`all\\?id=0`, "g"), `all?id=99`);
    }

    console.log("nextURI", nextURI);
    window.location.href = nextURI;
  }

  return (
    <div id={styles.container}>
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
            width: "90%",
            paddingLeft: 5,
          }}
          id={styles.url}
          value={URL}
          onChange={(e) => setURL(e.target.value)}
        ></textarea>
        <a
          style={{
            width: "10%",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            backgroundColor: "blue",
          }}
          href={`/all?id=99&URL=` + encodeURIComponent(URL)}
        >
          Redirect
        </a>
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
            onClick={() => getAllURL()}
          >
            Receive
          </button>

          <button
            type="button"
            className={styles.btb}
            style={{ color: "black" }}
            onClick={() => getInfo(true)}
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
            style={{ backgroundColor: "red" }}
            onClick={() =>
              textForMachine
                ? Push(textForMachine, lawInfoPush, fullText, true)
                : alert("Chưa chuyển đổi nội dung")
            }
          >
            Push
          </button>
          <button
            className={styles.btb}
            style={{ backgroundColor: "green" }}
            onClick={() => NaviNext()}
          >
            Next
          </button>
        </div>
        <div className={styles.output_container}>
          <p>Output</p>
          <textarea
            className={styles.output}
            value={contentOutputText}
            onChange={(e) => setContentOutput(e.target.value)}
            ref={outputArea}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
