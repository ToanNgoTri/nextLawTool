"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
// import {getValueinArea} from '../../public/asset/'
import styles from "../page.module.css";
// import ObjectLawPair from "../asset/ObjectLawPair";
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
  addJSONFile,
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

  const [fullText, setFullText] = useState("");
  const [textForMachine, setTextForMachine] = useState({});

  const inputArea = useRef(null);
  const outputArea = useRef(null);
  const lawRelatedRef = useRef(null);

  // const params = useParams(); // { id: "123" }
  // console.log('params',params);

  // const id = params['id'];

  const searchParams = useSearchParams();
  const url = searchParams.get("URL");
  const id = searchParams.get("id");
  // const RowAmount = searchParams.get("RowAmount");
  // const PageIndex = searchParams.get("PageIndex");
  // console.log('searchParams',searchParams);

  const [ObjectLawPair, setObjectLawPair] = useState({});

  useEffect(() => {
    fetch("/api/getlawjson")
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
    unitPublish = unitPublishText.split("; ");
    lawDaySign = lawDaySignText.replace(/\s/gim, "");

    nameSign = nameSignText.split("; ");
    // nameSign = [];

    lawDescription = lawDescriptionText;

    lawNumber = lawNumberText.replace(/\s/gim, "");

    lawRelated = [];

    lawKind = lawKindText.replace(/(^\s*|\s*$)/gim, "");

    lawNameDisplay = lawDescription;
    if (lawKind.match(/^(luật|bộ luật)/i)) {
      lawNameDisplay = lawDescription.replace(/,* của Quốc hội.*số.*/i, "");
      // lawNameDisplay = lawNameDisplay.replace(/,* số \d.*của Quốc hội.*/i, "");
      lawNameDisplay = lawNameDisplay.replace(
        /,* số \d.*(của Quốc hội)*.*/i,
        ""
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

  async function getInfo() {
    try {
      getValueinArea();
      let result;
      // let dataLaw

      // console.log('nameSign',nameSign);
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
          unitPublish
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
          lawDescription
        );
        // console.log('infoLaw',result);
        setContentOutput(result.partTwo);
      }
      setLawInfoPush(result.lawInfo);

      let yearSign = parseInt(result.lawInfo["lawDaySign"].getYear()) + 1900;
      let lawNumberForPush =
        result.lawInfo["lawNumber"] +
        (!result.lawInfo["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
          ? "(" + yearSign + ")"
          : "");

      if (
        ObjectLawPair[
          lawNumberForPush.toLowerCase().replace(/( và| của|,|&)/gim, "")
        ]
      ) {
        NaviNext();
      }
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

      // goToEndOutput()
      // return infoLaw;
    } catch (e) {
      beep();
      console.log(e);
    }
  }
  useEffect(() => {
    if (contentInputText) {
      getInfo();
    }
  }, [contentInputText, lawKindText]);

  useEffect(() => {
    if (Object.keys(lawInfoPush).length) {
      // console.log("lawInfoPush", lawInfoPush);

      clickToConvertContent(contentOutputText);
    }
  }, [lawInfoPush]);

  useEffect(() => {
    if (Object.keys(textForMachine).length) {
      // console.log("textForMachine", textForMachine);

      setTimeout(() => {
        Push(textForMachine, lawInfoPush, fullText).then((res) => {
          console.log(res);
          
          if (res) {
            setTimeout(() => {
              NaviNext()
            }, 3000);
          }
        });
      }, 1000);
    }
  }, [textForMachine]);

  async function clickToConvertContent(contentOutputText) {
    // console.log(lawInfoPush);
    let result;
    lawInfoPush["lawNumber"].match(/^\d+\/(TAND|VKS).+\-/gim)
      ? (result = convertContentOfficialDispatch(contentOutputText))
      : (result = convertContent(contentOutputText));

    setFullText(result.fullText);
    setTextForMachine(result.data);
    // console.log(result.data);
  }

  function getAllURL() {
    console.log(url);

    fetch(`/api/allurl?id=${id}&URL=` + encodeURIComponent(url)).then((res) =>
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
        setContentInput(res.data.content);
      })
    );
  }
  // useEffect(() => {
  //   if (contentInputText) {
  //     getInfo();
  //   }
  // }, [contentInputText]);

  // async function Push() {
  //   try {
  //     const yearSign = parseInt(lawInfoPush["lawDaySign"].getYear()) + 1900;
  //     const lawNumberForPush =
  //       lawInfoPush["lawNumber"] +
  //       (!lawInfoPush["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
  //         ? "(" + yearSign + ")"
  //         : "");

  //     const res = await fetch("/api/push", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         dataLaw: textForMachine,
  //         lawInfo: lawInfoPush,
  //         lawNumber: lawNumberForPush,
  //         contentText: fullText,
  //       }),
  //     });

  //     // Kiểm tra nếu server trả lỗi (status >= 400)
  //     if (!res.ok) {
  //       const text = await res.text();
  //       throw new Error(
  //         `Fetch thất bại: ${res.status} ${res.statusText}\n${text}`
  //       );
  //       return;
  //     }

  //     addJSONFile(lawInfoPush);
  //     // const data = await res.text();
  //     console.log("✅ Push thành công:");
  //   } catch (error) {
  //     console.error("❌ Lỗi khi push:", error);
  //     alert("Gửi dữ liệu thất bại. Vui lòng thử lại!");
  //   }
  // }

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
    window.scrollTo({ top: outputArea.current.scrollHeight - 100 });
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

  // const pathname = usePathname();
  function NaviNext() {
    console.log("url", url);

    let URI = url;
    // URI = encodeURIComponent(URI)
    console.log("URI", URI);

    if (!URI.match(/PageIndex=/)) {
      console.log("có");

      URI = `/all?id=${id}&URL=${encodeURIComponent(
        url + "&RowAmount=100&PageIndex=1"
      )}`;
    } else {
      URI = `/all?id=${id}&URL=${encodeURIComponent(url)}`;
    }
    // URI = encodeURIComponent(URI)
    // console.log('URI',URI);

    // if (URI.match(/(?<=AllURL\/).*(?=\?URL)/g)) {
    let currentIndex = id;
    let nextURI;

    console.log("URI", URI);

    if (currentIndex > 0) {
      // console.log(URI);

      nextURI = URI.replace(
        new RegExp(`all\\?id=${id}`, "g"),
        `all?id=${Number(id) + -1}`
      );
      // console.log(nextURI);

      // nextURI = URI.replace(/(?<=AllURL\/).*(?=\?URL)/g, `${currentIndex + 1}`);
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

      // nextURI = nextURI.replace(/(?<=AllURL\/).*(?=\?URL)/g, 0);
    }

    console.log("nextURI", nextURI);
    window.location.href = nextURI;

    // } else {
    //   console.log('none URI "AllURL"');
    // }
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

        {/* <button style={{ width: "5%" }} onClick={() => getAllURL()}>
          Get All
        </button> */}
      </div>
      <div id={styles.inner_container}>
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
          <p>lawDaySign</p>
          <textarea
            className={styles.input_area}
            id={styles.lawDaySign}
            value={lawDaySignText}
            onChange={(e) => setLawDaySign(e.target.value)}
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
        <div className={styles.navi_container} style={{ left: 566 }}>
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
            style={{ backgroundColor: "red" }}
            onClick={() =>
              textForMachine
                ? Push(textForMachine, lawInfoPush, fullText)
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
        </div>
      </div>
    </div>
  );
}
