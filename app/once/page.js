"use client";
import { useState, useRef, useEffect } from "react";
// import {getValueinArea} from '../../public/asset/'
import styles from "../page.module.css";
import ObjectLawPair from "../asset/ObjectLawPair";
import { useSearchParams } from "next/navigation";
<<<<<<< HEAD
// export const metadata = {
//   title: "Once",
// };
=======
>>>>>>> 336b056df908875133ce2bb47cbb9feebac7e0d7

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

  const searchParams = useSearchParams();
  const url = searchParams.get("URL");

  useEffect(() => {
    if (url) {
      setURL(url);
    setTimeout(() => {
      receive()
    }, 500);

    }

  }, []);

  // useEffect(() => {
  //   async function callBack() {
  //     await receive();
  //   }
  //   callBack();
  // }, [url]);

  async function receive() {

    console.log('URL',URL);
    console.log('url',url);
    

    fetch(`/api/url?url=${url?url:URL}`).then((res) =>
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

    setLawNumber;
    setUnitPublish;
    setLawKind;
    setNameSign;
    setLawDaySign;
    setLawDescription;
    setRoleSign;
    setContentInput;
    setLawRelated;
    setContentOutput;
  }

  function beep() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Tạo một oscillator (dao động) để phát âm thanh
    const oscillator = audioContext.createOscillator();

    // Cài đặt tần số của âm thanh
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Tần số 440 Hz (A4)

    // Kết nối oscillator đến output (loa)
    oscillator.connect(audioContext.destination);

    // Bắt đầu phát âm thanh
    oscillator.start();

    oscillator.stop(audioContext.currentTime + 1);
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
    unitPublish = unitPublishText.split("; ");
    lawDaySign = lawDaySignText.replace(/\s/gim, "");

    nameSignArrayDemo = nameSignText.split("; ");
    nameSign = [];

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

  function addDaysToDate(dateStr, daysToAdd) {
    // Tách chuỗi dd/mm/yyyy thành các phần (ngày, tháng, năm)
    let parts = dateStr.split("/"); // parts[0] là ngày, parts[1] là tháng, parts[2] là năm

    // Tạo đối tượng Date từ ngày tháng năm (lưu ý tháng trong JavaScript bắt đầu từ 0)
    let date = new Date(parts[2], parts[1] - 1, parts[0]);

    // Cộng thêm số ngày vào đối tượng Date
    date.setDate(date.getDate() + daysToAdd);

    // Trả về ngày mới sau khi cộng thêm
    return date;
  }

  function getRoleSign(contentRoleSign, nameSign) {
    contentRoleSign = contentRoleSign.replace(/\n\(*đã k(ý|í)\)*/gim, "");
    contentRoleSign = contentRoleSign.replace(/\n\[daky\]/gim, "");

    let roleSign = [];
    for (let a = 0; a < nameSign.length; a++) {
      // console.log('nameSign',nameSign);
      // console.log('contentRoleSign',contentRoleSign);

      let roleSignString = contentRoleSign
        .match(new RegExp(`.*(?=\n.*${nameSign[a]})`, "img"))[0]
        .toLowerCase(); //key.charAt(0).toUpperCase() + key.slice(1);

      roleSignString =
        roleSignString.charAt(0).toUpperCase() + roleSignString.slice(1);
      if (roleSignString.match(/^phó/i)) {
        roleSignString =
          "Phó " +
          roleSignString.charAt(4).toUpperCase() +
          roleSignString.slice(5);
      } else if (roleSignString.match(/quốc hội/i)) {
        roleSignString = roleSignString.replace(/quốc hội/i, "Quốc hội");
      }
      roleSignString = roleSignString.replace(/\s/gm, " ");
      roleSign.push(roleSignString);
    }
    return roleSign;
  }

  function getArrangeUnitPublic(
    roleSignString,
    nameSignArrayDemo,
    lawKind,
    unitPublish
  ) {
    let nameSign = [];
    let unitPbDemo = [];
    // console.log('nameSignArrayDemo',nameSignArrayDemo);
    // console.log('roleSignString',roleSignString);
    // console.log('unitPublish',unitPublish);

    nameSignArrayDemo.map((nameSignDemo, i) => {
      let nameSignString = roleSignString.match(
        new RegExp(`.*${nameSignDemo}.*`, "img")
      )[0];

      nameSign.push(nameSignString);
      let nameSignStringEffectArea = roleSignString.match(
        new RegExp(`(\.*\\n){0,3}\.*${nameSignDemo}\.*`, "img")
      )[0];
      //    let nameSignStringEffectArea = roleSignString.match(new RegExp(`${roleSignString.match(new RegExp(`(\.*\\n){0,3}\.*${nameSignDemo}\.*`,'img'))[0]  }`,'img'))[0]
      nameSignStringEffectArea = nameSignStringEffectArea.replace(/\n/gim, " ");
      if (lawKind.match(/liên tịch/i)) {
        for (let b = 0; b < unitPublish.length; b++) {
          // console.log(unitPublish[b]);

          if (
            nameSignStringEffectArea.match(
              new RegExp(`${unitPublish[b].slice(0, 6)}`, "igm")
            ) &&
            nameSignStringEffectArea.match(
              new RegExp(
                `${unitPublish[b].slice(
                  unitPublish[b].length - 6,
                  unitPublish[b].length
                )}`,
                "igm"
              )
            )
          ) {
            unitPbDemo[i] = unitPublish[b];
            break;
          }
        }
      } else {
        unitPbDemo = unitPublish;
      }
    });
    return { unitPbDemo, nameSign };
  }

  function getLawDayActive(text, daySign) {
    let lawDayActive;
    if (
      text.match(
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^;]+)sau \d* ngày/im
      )
    ) {
      lawDayActive = text.match(
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^;]+)sau \d* ngày/im
      )[0];
      countDaysAfter = lawDayActive.match(/\d+/gim)[0];
      lawDayActive = addDaysToDate(daySign, parseInt(countDaysAfter));
      console.log(3);
    } else if (
      text.match(
        // /(?<=^(Điều|Ðiều|Điều) \d.*(Hiệu lực|thi hành|thực hiện).*\n).*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực).* từ ngày k/im
        /(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực).{0,19}từ ngày (k|ban hành)/im
      )
    ) {
      console.log(1);

      lawDayActive = addDaysToDate(daySign, 0);
    } else if (
      text.match(
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP|Quy chuẩn kỹ thuật|Định mức)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]{0,19})(ngày|ngày)\s*\d*\s*(tháng|tháng)\s*\d*\s*năm\s*\d*/im
        // /(?<=^(Điều|Ðiều|Điều) \d.{0,15}(Hiệu lực|thi hành|thực hiện).*(\n.*)*.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]+)(ngày|ngày)\s*\d*\s*(tháng|tháng)\s*\d*\s*năm\s*\d*/im
      )
    ) {
      let lawDayActiveDemo = text.match(
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP|Quy chuẩn kỹ thuật|Định mức)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]{0,19})(ngày|ngày)\s*\d*\s*(tháng|tháng)\s*\d*\s*năm\s*\d*/gim
      )[
        text.match(
          /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP|Quy chuẩn kỹ thuật|Định mức)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]{0,19})(ngày|ngày)\s*\d*\s*(tháng|tháng)\s*\d*\s*năm\s*\d*/gim
        ).length - 1
      ];
      console.log(2);
      let RemoveDay = lawDayActiveDemo.replace(/(ngày|ngày) */im, "");
      let RemoveMonth = RemoveDay.replace(/ *(tháng|tháng) */im, "/");
      lawDayActive = addDaysToDate(RemoveMonth.replace(/ *năm */im, "/"), 0);
    } else if (
      text.match(
        // /(?<=^(Điều|Ðiều|Điều) \d.*(Hiệu lực|thi hành|thực hiện).*(\n.*)*.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]+)\d+\/\d+\/\d+/im
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]{0,19}ngày\s)\d+(\/|\-)\d+(\/|\-)\d+/im
      )
    ) {
      lawDayActive = text.match(
        /(?<=(LUẬT|BỘ LUẬT|NGHỊ ĐỊNH|Nghị định|THÔNG TƯ|NGHỊ QUYẾT|THÔNG TƯ LIÊN TỊCH|QUYẾT ĐỊNH|PHÁP LỆNH|CHỈ THỊ|BÁO CÁO|HƯỚNG DẪN|HIẾN PHÁP)(\s(này|này))?.*(có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực|có hiệu lực)[^\d]{0,19}ngày\s)\d+(\/|\-)\d+(\/|\-)\d+/im
      )[0];
      lawDayActive = lawDayActive.replace(/-/gim, "/");

      lawDayActive = addDaysToDate(lawDayActive, 0);
    } else {
      console.log(4);
      lawDayActive = null;
    }

    return lawDayActive;
  }

  async function getLawRelated(text, dayActive) {
    function uniqueArray(orinalArray) {
      let noDuplicate = orinalArray.filter((elem, position, arr) => {
        return arr.indexOf(elem) == position && elem != lawNumber;
      });

      let removeDayMonth = noDuplicate.map((value, index) => {
        return value.replace(/ngày.*tháng.*(?=năm)/gim, "");
      });

      return removeDayMonth;
    }

    text = text.replace(/\s/gim, " ");

    let lawRelatedDemo = text.match(
      /(?<!(mẫu( số)?|ví dụ.*)) \d+\/?\d*\/\D+\-[^(\s|,|.| |\:|\"|\'|\;|\{|\}|”)]+/gi
    );
    lawRelatedDemo =
      lawRelatedDemo &&
      text.match(/(?<!(mẫu( số)?|ví dụ.*)) \d+\/?\d*\/QH\d{1,2}/gi)
        ? [
            ...lawRelatedDemo,
            ...text.match(/(?<!(mẫu( số)?|ví dụ.*)) \d+\/?\d*\/QH\d{1,2}/gi),
          ]
        : !lawRelatedDemo
        ? text.match(/(?<!(mẫu( số)?|ví dụ.*)) \d+\/?\d*\/QH\d{1,2}/gi)
        : lawRelatedDemo;

    let lawRelatedDemo2 = lawRelatedDemo
      ? lawRelatedDemo.map(function (item) {
          return item.replace(/ */g, "");
        })
      : [];

    if (
      text.match(
        /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
      )
    ) {
      for (
        let y = 0;
        y <
        text.match(
          /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
        ).length;
        y++
      ) {
        if (
          !text
            .match(
              /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
            )
            [y].match(/(?<=năm \d+) và (?=luật sửa)/gi)
        ) {
          if (
            !text
              .match(
                /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
              )
              [y].match(/(luật|Luật|bộ luật|pháp lệnh) số \d/gi)
          ) {
            if (
              text
                .match(
                  /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
                )
                [y].match(
                  /(?<=năm \d+) và (?=(NGHỊ ĐỊNH|Nghị định|THÔNG TƯ))/gi
                )
            ) {
              let lawRelatedString = text
                .match(
                  /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+(?= và (NGHỊ ĐỊNH|Nghị định|THÔNG TƯ))/gi
                )
                [y].replace(/ số \d+[^( |,)]+/gim, "");
              lawRelatedString = lawRelatedString.replace(
                / ngày \d+\/\d+\/\d+/gim,
                ""
              );
              lawRelatedString = lawRelatedString.replace(
                / ngày \d+ *\d+ *\d+/gim,
                ""
              );
              lawRelatedString = lawRelatedString.replace(
                / (ngày|ngày) *\d+ *(tháng|tháng) *\d+/gim,
                ""
              );
              lawRelatedDemo2 = [...lawRelatedDemo2, lawRelatedString];
            } else {
              let lawRelatedString = text
                .match(
                  /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
                )
                [y].replace(/ số \d+[^( |,)]+/gim, "");
              lawRelatedString = lawRelatedString.replace(
                / ngày \d+\/\d+\/\d+/gim,
                ""
              );
              lawRelatedString = lawRelatedString.replace(
                / ngày \d+ *\d+ *\d+/gim,
                ""
              );
              lawRelatedString = lawRelatedString.replace(
                / (ngày|ngày) *\d+ *(tháng|tháng) *\d+/gim,
                ""
              );
              lawRelatedDemo2 = [...lawRelatedDemo2, lawRelatedString];
            }
          }
        } else {
          let lawRelatedString = text
            .match(
              /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+năm \d+/gi
            )
            [y].replace(/ số \d+[^( |,)]+/gim, "");
          lawRelatedString = lawRelatedString.replace(
            / ngày \d+\/\d+\/\d+/gim,
            ""
          );
          lawRelatedString = lawRelatedString.replace(
            / ngày \d+ *\d+ *\d+/gim,
            ""
          );
          lawRelatedString = lawRelatedString.replace(
            / (ngày|ngày) *\d+ *(tháng|tháng) *\d+/gim,
            ""
          );
          lawRelatedDemo2 = [
            ...lawRelatedDemo2,
            ...lawRelatedString.split(/(?<=năm \d+) và (?=luật sửa)/gi),
          ];
        }
      }
    } else if (
      text.match(
        /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+ngày \d+\/+\d+\/\d+/gi
      )
    ) {
      for (
        let y = 0;
        y <
        text.match(
          /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+ngày \d+\/+\d+\/\d+/gi
        ).length;
        y++
      ) {
        if (
          !text
            .match(
              /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+ngày \d+\/+\d+\/\d+/gi
            )
            [y].match(/(?<=ngày \d+\/+\d+\/\d+) và (?=luật sửa)/gi)
        ) {
          let lawRelatedString = text
            .match(
              /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+ngày \d+\/+\d+\/\d+/gi
            )
            [y].replace(/ số \d+[^( |,)]+/gim, "");
          lawRelatedString = lawRelatedString.replace(
            / ngày \d+\/\d+\/(\d+)/gim,
            " năm $1"
          );

          lawRelatedDemo2 = [...lawRelatedDemo2, lawRelatedString];
        } else {
          let lawRelatedString = text
            .match(
              /(?<=(căn cứ |; ))(luật|Luật|bộ luật|pháp lệnh)[^(;|\n)]+ngày \d+\/+\d+\/\d+/gi
            )
            [y].replace(/ số \d+[^( |,)]+/gim, "");
          lawRelatedString = lawRelatedString.replace(
            / ngày \d+\/\d+\/(\d+)/gim,
            " năm $1"
          );
          lawRelatedDemo2 = [
            ...lawRelatedDemo2,
            ...lawRelatedString.split(
              /(?<=ngày \d+\/+\d+\/\d+) và (?=luật sửa)/gi
            ),
          ];
        }
      }
    }

    if (text.match(/(?<=(căn cứ |; |vào ))(hiến pháp)[^(;|\n)]+/gi)) {
      lawRelatedDemo2 = [
        ...lawRelatedDemo2,
        ...text.match(/(?<=(căn cứ |; |vào ))(hiến pháp)[^(;|\n)]+/gi),
      ];
    }
    lawRelatedDemo2 = lawRelatedDemo2.map((item) => {
      return item.replace(/ (ngày|ngày) ?\d+ ?(tháng|tháng) ?\d+/gim, "");
    });

    lawRelatedDemo2 = lawRelatedDemo2.map((item) => {
      return item.replace(/,?\s(?=năm)/gim, " ");
    });

    lawRelatedDemo2 = lawRelatedDemo2.map((item) => {
      return item
        .replace(/\s+/gim, " ")
        .replace(/^\s+/gim, "")
        .replace(/\s+$/gim, "");
    });

    let lawRelated = uniqueArray(lawRelatedDemo2);

    lawRelated = lawRelated.filter(
      (law) => !law.match(/^luật năm/i) && !law.match(/^51\/2001\/QH10/i)
    );

    let lawRelatedObject = {};
    lawRelated = lawRelated.map((law) => {
      return (lawRelatedObject[law] = 0);
    });

    let lawPairObject = ObjectLawPair;
    // await fetch("once/asset/ObjectLawPair.json")
    //   .then((response) => response.json()) // Chuyển đổi response thành JSON
    //   .then((data) => {
    //     lawPairObject = data;
    //   })
    //   .catch((error) => console.log("Error:", error));

    for (let a = 0; a < Object.keys(lawRelatedObject).length; a++) {
      if (
        lawPairObject[
          Object.keys(lawRelatedObject)
            [a].toLowerCase()
            .replace(/( và| của|,|&)/gim, "")
        ]
      ) {
        if (
          lawPairObject[
            Object.keys(lawRelatedObject)
              [a].toLowerCase()
              .replace(/( và| của|,|&)/gim, "")
          ].match(/\s/)
        ) {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] =
            lawPairObject[
              Object.keys(lawRelatedObject)
                [a].toLowerCase()
                .replace(/( và| của|,|&)/gim, "")
            ];
          // console.log(2);
        } else {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] =
            lawPairObject[
              Object.keys(lawRelatedObject)
                [a].toLowerCase()
                .replace(/( và| của|,|&)/gim, "")
            ];
        }
      } else if (Object.keys(lawRelatedObject)[a].match(/Hiến pháp/gim)) {
        console.log("dayActive", dayActive);

        const date = new Date(dayActive);

        console.log("date", date);
        if (date > new Date("2025-06-16")) {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] =
            "52/VBHN-VPQH(2025)";
        } else if (date > new Date("2014-01-01")) {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] = "0001/HP";
        } else if (date > new Date("2002-01-07")) {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] = "0003/HP(2001)";
        } else if (date > new Date("1992-04-15")) {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] = "0002/HP(1992)";
        } else {
          lawRelatedObject[Object.keys(lawRelatedObject)[a]] = 0;
        }
      } else {
        lawRelatedObject[Object.keys(lawRelatedObject)[a]] = 0;
      }
    }
    return lawRelatedObject;
  }

  function RemoveNoOrder(array) {
    let prev;
    for (let l = 0; l < array.length; l++) {
      if (l == 0) {
        prev = parseInt(array[l].match(/(?<=(Điều|Điều)\s)\d+/gim)[0]);
      }

      let current = parseInt(array[l].match(/(?<=(Điều|Điều)\s)\d+/gim)[0]);
      if (current == prev || current == prev + 1) {
        prev = parseInt(array[l].match(/(?<=(Điều|Điều)\s)\d+/gim)[0]);
      } else {
        delete array[l];
      }
    }
    let arr = [];
    array.map((key, i) => {
      key ? arr.push(key) : "";
    });
    return arr;
  }

  async function getInfo() {
    try {
      getValueinArea();
      let result;
      if (roleSignText && lawRelatedText) {
        result = await getNormalTextInfo();
      } else {
        result = await convertBareTextInfo();
      }

      addJSONFile();
      return result;
    } catch (e) {
      beep();
      console.log(e);
    }
  }

  function convertPartOne() {
    let b = contentInputText;
    let b1 = b.replace(/^ */gim, ""); // bỏ các space ở đầu mỗi dòng
    let b2 = b1.replace(/\(*đã k(ý|í)\)*/gim, "");
    b2 = b2.replace(/\[daky\]/gim, "");
    let b3 = b2.replace(/^\s*nơi nhận.*\n([^\s].*\n)*/gim, "");
    let b4 = b3.replace(/\n+\s+$/gim, "");
    let b5 = b4.replace(/\n*$/gim, ""); //bỏ xuống dòng ở cuối
    let b6 = b5.replace(/^\s*/gim, ""); // bỏ space, xuống dòng ở đầu
    let b7 = b6.replace(/\s*$/gim, ""); // bỏ space, xuống dòng ở cuối
    let b8 = b7.replace(/(?<=\w)\n\[\d+\].*$(\n.*)*$/gim, ""); // bỏ mấy cái chỉ mục của VBHN đi
    let b9 = b8.replace(/\n+/gim, "\n"); // biến nhiều xuống dòng thành 1 xuống dòng

    let b10 = b9;
    // let b10a = []; // kết nối "Phần thứ với nội dung "phần thứ ...", trường hợp bị tách 2 hàng

    // for (let c = 0; c < 5; c++) {
    //   if (!c) {
    //     b10a[c] = b9.replace(
    //       /(?<=^(Phần|PHẦN)\s(THỨ|I|l|1).*)\n(?!(((Điều|Ðiều|Điều) \d.*)|(chương (V|I|X|\d).*$.*)))/gim,
    //       ": "
    //     );
    //   } else {
    //     b10a[c] = b10a[c - 1].replace(
    //       /(?<=^(Phần|PHẦN)\s(THỨ|I|l|1).*)\n(?!(((Điều|Ðiều|Điều) \d.*)|(chương (V|I|X|\d).*$.*)))/gim,
    //       " "
    //     );
    //   }
    // }
    // b10 = b10a[4];

    let b11 = b10.replace(/(\[|\()\d*(\]|\))/gim, ""); // bỏ chỉ mục số đi

    let b12 = b11.replace(/(?<=^Chương (V|I|X|\d)*)\.?\s/gim, ": ");
    // b12 = b12.replace(/(?<=^Chương (V|I|X|\d)*) /gim, ":");
    b12 = b12.replace(/(?<=^Chương.{0,5})l/gim, "I");
    let b13 = b12.replace(/  +/gim, " "); // bỏ khoảng cách 2 space

    return b13;
  }

  function convertPartTwo(partOne) {
    let b14 = "";
    for (let t = 0; t <= 30; t++) {
      let clause;
      clause = partOne.match(`(?<=(\n.*){${t}}).*`, "im")[[0]];

      if (
        lawKind ? lawKind.match(/nghị quyết/i) : partOne.match(/^nghị quyết/i)
      ) {
        // bỏ phần đầu
        b14 = partOne.replace(/^(.*\n)*QUYẾT NGHỊ(:|\.|\s|)\n/i, "");

        break;
      } else if (clause.match(/^(Phần|PHẦN)\s(THỨ|I|l|1)/gim)) {
        let firstSection = partOne.match(/^(Phần|PHẦN)\s(THỨ|I|l|1).*/im)[0];

        b14 = partOne.replace(
          new RegExp(`(.*\\n)*(?=${firstSection})\\b`, "img"),
          ""
        );
        break;
      } else if (clause.match(/^(Chương|CHƯƠNG)\s(I|l|1)/gim)) {
        let firstChapter = partOne.match(/^(Chương|CHƯƠNG)\s(I|l|1).*/im)[0];

        b14 = partOne.replace(
          new RegExp(`(.*\\n)*(?=${firstChapter})`, "img"),
          ""
        );
        break;
      } else if (clause.match(/^(Điều|Ðiều|Điều)\s(I|l|1)/gim)) {
        let firstArticle = partOne.match(
          /^(Điều|Ðiều|Điều)\s(I|l|1).{0,10}/im
        )[0]; // lấy 10 ký tự thôi cho chắc
        b14 = partOne.replace(
          new RegExp(`(.*\\n)*(?=${firstArticle})`, "img"),
          ""
        );
        break;
      }
    }

    let b15 = b14;
    if (b14.match(/(?<=.*\.\/\.)(\n.*)*/gim)) {
      b15 = b14.replace(/(?<=.*\.\/\.)(\n.*)*/gim, ""); //  bỏ tất cả sau ./.
    }

    if (b14.match(/^TM\s?\./m)) {
      b15 = b15.replace(/^TM\s?.*(\n.*)*/m, "");
    } else if (b15.match(/^KT\s?\./m)) {
      b15 = b15.replace(/^KT\s?.*(\n.*)*/m, "");
    } else if (b15.match(new RegExp(nameSign[0]), "img")) {
      for (let k = 0; k < nameSign.length; k++) {
        if (
          b15.match(
            new RegExp(
              `\n.*\n(Thiếu|trung|thượng|đại) ?(Tá|Tướng) ?${nameSign[k]}(\n(.*\n.*)*)*`,
              "img"
            )
          ) &&
          b15
            .match(
              new RegExp(
                `\n.*\n(Thiếu|trung|thượng|đại) ?(Tá|Tướng) ?${nameSign[k]}(\n(.*\n.*)*)*`,
                "img"
              )
            )[0]
            .match(/(THỨ|PHÓ)/gim) &&
          !b15
            .match(
              new RegExp(
                `\n.*\n(Thiếu|trung|thượng|đại) ?(Tá|Tướng) ?${nameSign[k]}(\n(.*\n.*)*)*`,
                "img"
              )
            )[0]
            .match(/(THỨ|PHÓ)/gim).length
        ) {
          b15 = b15.replace(
            new RegExp(
              `\n.*\n(Thiếu|trung|thượng|đại) ?(Tá|Tướng) ?${nameSign[k]}(\n(.*\n.*)*)*`,
              "img"
            ),
            ""
          ); // tất cả hàng cuối
        } else if (
          b15.match(new RegExp(`\n.*\n${nameSign[k]}(\n(.*\n.*)*)*`, "img"))[0]
        ) {
          b15 = b15.replace(
            new RegExp(`\n.*\n${nameSign[k]}(\n(.*\n.*)*)*`, "img"),
            ""
          );
        } else {
          b15 = b15.replace(
            new RegExp(
              `\n.*\n.*\n(Thiếu|trung|thượng|đại) ?(Tá|Tướng) ?${nameSign[k]}(\n(.*\n.*)*)*`,
              "img"
            ),
            ""
          ); // tất cả hàng cuối
        }
      }
    }

    let b16 = b15.replace(/\n$/gim, ""); // bỏ hàng dư trống ở cuối
    let b17 = b16.replace(/\n*VĂN PHÒNG QUỐC HỘI(\n.*)*/gim, ""); // bỏ hàng dư trống ở cuối

    return b17;
  }

  async function convertBareTextInfo() {
    console.log("convertBareTextInfo");

    nameSign = nameSignArrayDemo;

    let partOne = convertPartOne();

    let partTwo = convertPartTwo(partOne);

    nameSign = nameSignArrayDemo;
    roleSign = getRoleSign(partOne, nameSign);

    nameSign = getArrangeUnitPublic(
      partOne,
      nameSignArrayDemo,
      lawKind,
      unitPublish
    )["nameSign"];
    unitPublish = getArrangeUnitPublic(
      partOne,
      nameSignArrayDemo,
      lawKind,
      unitPublish
    )["unitPbDemo"];

    lawDayActive = getLawDayActive(partOne, lawDaySign);

    if (lawRelatedText) {
      lawRelated = await getLawRelated(lawRelatedText, lawDayActive);
    } else {
      lawRelated = await getLawRelated(partOne, lawDayActive);
    }

    lawDaySign = addDaysToDate(lawDaySign, 0);

    lawInfo["lawDescription"] = lawDescription;
    lawInfo["lawNumber"] = lawNumber;
    lawInfo["unitPublish"] = unitPublish;
    lawInfo["lawKind"] = lawKind;
    lawInfo["lawDaySign"] = lawDaySign;
    lawInfo["lawDayActive"] = lawDayActive;
    lawInfo["lawNameDisplay"] = lawNameDisplay;
    lawInfo["lawRelated"] = lawRelated;
    lawInfo["nameSign"] = nameSign;
    lawInfo["roleSign"] = roleSign;

    console.log("lawDescription", lawInfo["lawDescription"]);
    console.log("lawNumber", lawInfo["lawNumber"]);
    console.log("lawKind", lawInfo["lawKind"]);
    console.log("lawDaySign", lawInfo["lawDaySign"]);
    console.log("lawDayActive", lawInfo["lawDayActive"]);
    console.log("lawNameDisplay", lawInfo["lawNameDisplay"]);
    console.log("lawRelated", lawInfo["lawRelated"]);
    console.log("unitPublish", lawInfo["unitPublish"]);
    console.log("nameSign", lawInfo["nameSign"]);
    console.log("roleSign", lawInfo["roleSign"]);

    setContentOutput(partTwo);
    return { lawInfo };
  }

  async function getNormalTextInfo() {
    console.log("getNormalTextInfo");

    let roleSignString = roleSignText;

    nameSign = getArrangeUnitPublic(
      roleSignString,
      nameSignArrayDemo,
      lawKind,
      unitPublish
    )["nameSign"];
    unitPublish = getArrangeUnitPublic(
      roleSignString,
      nameSignArrayDemo,
      lawKind,
      unitPublish
    )["unitPbDemo"];

    let contentRoleSign = roleSignText;
    roleSign = getRoleSign(contentRoleSign, nameSign);

    lawDayActive = getLawDayActive(contentText, lawDaySign);

    let introduceString = lawRelatedText;
    lawRelated = await getLawRelated(introduceString, lawDayActive);

    setContentOutput(contentText);

    lawDaySign = addDaysToDate(lawDaySign, 0);

    setLawInfoPush({
      unitPublish,
      lawDaySign,
      nameSign,
      roleSign,
      lawDayActive,
      lawDescription,
      lawNumber,
      lawRelated,
      lawKind,
      lawNameDisplay,
    });

    lawInfo = {
      unitPublish,
      lawDaySign,
      nameSign,
      roleSign,
      lawDayActive,
      lawDescription,
      lawNumber,
      lawRelated,
      lawKind,
      lawNameDisplay,
    };

    console.log("lawDescription", lawInfo["lawDescription"]);
    console.log("lawNumber", lawInfo["lawNumber"]);
    console.log("lawKind", lawInfo["lawKind"]);
    console.log("lawDaySign", lawInfo["lawDaySign"]);
    console.log("lawDayActive", lawInfo["lawDayActive"]);
    console.log("lawNameDisplay", lawInfo["lawNameDisplay"]);
    console.log("lawRelated", lawInfo["lawRelated"]);
    console.log("unitPublish", lawInfo["unitPublish"]);
    console.log("nameSign", lawInfo["nameSign"]);
    console.log("roleSign", lawInfo["roleSign"]);

    // console.log('lawInfo',lawInfo);
  }

  let data = [];
  async function convertContent() {
    data = [];

    let input = contentOutputText;

    let i0 = input.replace(
      /^(Điều|Ðiều|Điều)( |\u00A0)+(\d+\w?)\.(.*)/gim,
      "Điều $3:$4"
    );
    // điều . thành điều:

    let i1 = i0.replace(
      /^(Điều|Ðiều|Điều)( |\u00A0)+(\d+\w?)\.(.*)/gim,
      "Điều $3:$4"
    );

    let i2 = i1.replace(/­/gm, "");

    let i3 = i2.replace(/(?<=^Chương (V|I|X|\d)*)\./gim, "");

    let i4;

    let i4a = [];
    let initial = 4; // số dòng tối đa mặc định có thể bị xuống dòng làm cho phần 'chương' không được gộp
    // thành 1 dòng (có thể thay đổi để phù hợp tình hình)

    for (let b = 0; b < initial; b++) {
      if (!b) {
        i4a[b] = i3.replace(/(?<=^Mục .*)\n(?!(Điều|Ðiều|Điều) \d.*)/gim, ": ");
      } else {
        i4a[b] = i4a[b - 1].replace(
          /(?<=^Mục .*)\n(?!(Điều|Ðiều|Điều) \d.*)/gim,
          " "
        );

        // kết nối "mục với nội dung "mục", trường hợp bị tách 2 hàng
      }
    }

    i4 = i4a[initial - 1];

    let i5 = i4.replace(/^(Mục|Mục)(.*)\n/gim, ""); // bỏ mục đi

    let i6 = i5.replace(/(\[|\()\d*(\]|\))/gim, ""); // bỏ chỉ mục

    let i7 = i6.replace(/\u00A0/gim, " ");

    let i8;
    let i8a = []; // kết nối "Phần thứ với nội dung "phần thứ ...", trường hợp bị tách 2 hàng

    for (let c = 0; c < 5; c++) {
      if (!c) {
        i8a[c] = i7.replace(
          /(?<=^(Phần|PHẦN)\s(THỨ|I|l|1).*)\n(?!(((Điều|Ðiều|Điều) \d.*)|(chương (V|I|X|\d).*$.*)))/gim,
          ": "
        );
      } else {
        i8a[c] = i8a[c - 1].replace(
          /(?<=^(Phần|PHẦN)\s(THỨ|I|l|1).*)\n(?!(((Điều|Ðiều|Điều) \d.*)|(chương (V|I|X|\d).*$.*)))/gim,
          " "
        );
      }
    }
    i8 = i8a[4];

    let i9 = i8.replace(/(?<=^(Phần|PHẦN)\s(THỨ|I|l|\d)+[^\.]*)\./im, ""); // bỏ dấu chấm cuối chữ phần thứ ...

    let i10;
    let i10a = []; // kết nối "chương với nội dung "chương ...", trường hợp bị tách 2 hàng

    for (let c = 0; c < initial; c++) {
      if (!c) {
        i10a[c] = i9.replace(
          /(?<=^Chương (V|I|X|\d).*)\n(?!(Điều|Ðiều|Điều) \d.*)/gim,
          ": "
        );
      } else {
        i10a[c] = i10a[c - 1].replace(
          /(?<=^Chương (V|I|X|\d).*)\n(?!(Điều|Ðiều|Điều) \d.*)/gim,
          " "
        );
      }
    }

    i10 = i10a[initial - 1];
    i10 = i10.replace(/(?<=^Chương (V|I|X|\d)*) /gim, ": ");

    contentText = i10;
    setFullText(i10);
    setContentOutput(i10);

    if (i10.match(/^CHƯƠNG.*/i)) {
      // nếu có chương ...

      let chapterArray; // lấy riêng lẻ từng chương thành 1 array
      if (i10.match(/^Chương (V|I|X|\d).*$/gim)) {
        chapterArray = i10.match(/^Chương (V|I|X|\d).*$/gim);
      } else {
        chapterArray = null;
      }

      let articleArray; // lấy khoảng giữa các chương
      let allArticle = []; // lấy riêng lẻ các điều
      let point = [];
      let d = -1;

      for (var a = 0; a < chapterArray.length; a++) {
        articleArray = [];

        if (a < chapterArray.length - 1) {
          let chapterArrayA = chapterArray[a].replace(/\\/gim, "\\\\");
          chapterArrayA = chapterArrayA.replace(/\(/gim, "\\(");
          chapterArrayA = chapterArrayA.replace(/\)/gim, "\\)");

          let chapterArrayB = chapterArray[a + 1].replace(/\\/gim, "\\\\");
          chapterArrayB = chapterArrayB.replace(/\(/gim, "\\(");
          chapterArrayB = chapterArrayB.replace(/\)/gim, "\\)");

          let replace = `(?<=${chapterArrayA}\n)(.*\n)*(?=${chapterArrayB})`;
          let re = new RegExp(replace, "gim");
          articleArray = i10.match(re);
        } else {
          let chapterArrayA = chapterArray[a].replace(/\(/gim, "\\(");
          chapterArrayA = chapterArrayA.replace(/\)/gim, "\\)");
          chapterArrayA = chapterArrayA.replace(/\\/gim, "\\\\");

          let replace = `((?<=${chapterArrayA}))((\n.*)*)$`;
          let re = new RegExp(replace, "gim");
          articleArray = i10.match(re);
        }

        if (articleArray[0].match(/^(Điều|Điều) \d+(.*)$/gim)) {
          data[a] = { [chapterArray[a]]: [] };
          allArticle.push(articleArray[0].match(/^(Điều|Điều) \d+(.*)$/gim));
        } else {
        }

        // console.log('allArticle[a]',allArticle[a]);

        allArticle[a] = RemoveNoOrder(allArticle[a]);

        let countArticle = allArticle[a].length;

        for (let b = 0; b < countArticle; b++) {
          let TemRexgexArticleA = allArticle[a][b];

          TemRexgexArticleA = allArticle[a][b].replace(/\\/gm, "\\\\");
          TemRexgexArticleA = TemRexgexArticleA.replace(/\(/gim, "\\(");
          TemRexgexArticleA = TemRexgexArticleA.replace(/\)/gim, "\\)");
          TemRexgexArticleA = TemRexgexArticleA.replace(/\./gim, "\\.");

          if (b < countArticle - 1) {
            let TemRexgexArticleB = allArticle[a][b + 1];

            TemRexgexArticleB = allArticle[a][b + 1].replace(/\\/gm, "\\\\");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");

            let replace = `(?<=${TemRexgexArticleA}\n)(.*\n)*(?=${TemRexgexArticleB})`;
            let re = new RegExp(replace, "gim");

            if (articleArray[0].match(re)) {
              let e = articleArray[0].match(re)[0];
              e = articleArray[0].match(re)[0].replace(/\n+$/, "");
              e = e.replace(/^\n+/, "");

              point.push(e);
            } else {
              point.push([""]);
            }
          } else {
            let TemRexgexArticleB = allArticle[a][b];

            TemRexgexArticleB = allArticle[a][b].replace(/\\/gm, "\\\\");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");

            let replace = `(?<=${TemRexgexArticleB}\n)(.*\n)*.*$`;
            let re = new RegExp(replace, "im");

            if (articleArray[0].match(re)) {
              let e = articleArray[0].match(re)[0];
              e = articleArray[0].match(re)[0].replace(/\n+$/, "");
              e = e.replace(/^\n+/, "");

              point.push(e);
            } else {
              point.push([""]);
            }
          }

          for (let c = 0; c < 1; c++) {
            d++;

            data[a][chapterArray[a]][b] = { [allArticle[a][b]]: point[d] };
          }
        }
      }
      setTextForMachine(data);
    } else if (i10.match(/^(Phần|PHẦN)\s(THỨ|I|l|\d).*/i)) {
      //////////////////////////////////////////////////////////  // nếu có phần thứ ...

      let sectionArray;

      if (i10.match(/^(Phần|PHẦN)\s(THỨ|I|l|\d).*/gim)) {
        sectionArray = i10.match(/^(Phần|PHẦN)\s(THỨ|I|l|\d).*/gim);
      } else {
        sectionArray = null;
      }

      let ContentInEachSection; // lấy khoảng giữa các phần
      data = [];
      let point = [];

      for (var a = 0; a < sectionArray.length; a++) {
        ContentInEachSection = [];
        if (a < sectionArray.length - 1) {
          let replace = `(?<=${sectionArray[a]}\n)(.*\n)*(?=${
            sectionArray[a + 1]
          })`;
          let re = new RegExp(replace, "gim");
          ContentInEachSection = i10.match(re);
        } else {
          let replace = `((?<=${sectionArray[a]}))((\n.*)*)$`;
          let re = new RegExp(replace, "gim");
          ContentInEachSection = i10.match(re);
        }

        let chapterArray = []; // mảng có từng chapter riêng lẻ
        let articleArray = []; // mảng có từng Điều riêng lẻ

        if (ContentInEachSection[0].match(/^Chương.*$/gim)) {
          // nếu mà trong 'phần thứ...' có chương

          chapterArray = ContentInEachSection[0].match(/^Chương.*$/gim);
          data[a] = {};
          data[a][sectionArray[a]] = [];

          let ContentInEachChapter = [];
          for (let b = 0; b < chapterArray.length; b++) {
            if (b < chapterArray.length - 1) {
              let chapterArrayA = chapterArray[b].replace(/\(/gim, "\\(");
              chapterArrayA = chapterArrayA.replace(/\)/gim, "\\)");

              let chapterArrayB = chapterArray[b + 1].replace(/\(/gim, "\\(");
              chapterArrayB = chapterArrayB.replace(/\)/gim, "\\)");

              let replace = `(?<=${chapterArrayA}\n)(.*\n)*(?=${chapterArrayB})`;
              let re = new RegExp(replace, "gim");
              ContentInEachChapter = ContentInEachSection[0].match(re);
            } else {
              let chapterArrayA = chapterArray[b].replace(/\(/gim, "\\(");
              chapterArrayA = chapterArrayA.replace(/\)/gim, "\\)");

              let replace = `((?<=${chapterArrayA}))((\n.*)*)$`;
              let re = new RegExp(replace, "gim");
              ContentInEachChapter = ContentInEachSection[0].match(re);
            }

            articleArray = ContentInEachChapter[0].match(
              /^(Điều|Điều) \d+(.*)$/gim
            );
            data[a][sectionArray[a]][b] = {};
            data[a][sectionArray[a]][b][chapterArray[b]] = [];

            articleArray = RemoveNoOrder(articleArray);

            for (let c = 0; c < articleArray.length; c++) {
              let TemRexgexArticleA = articleArray[c];

              TemRexgexArticleA = articleArray[c].replace(/\\/gim, "\\\\");
              TemRexgexArticleA = TemRexgexArticleA.replace(/\(/gim, "\\(");
              TemRexgexArticleA = TemRexgexArticleA.replace(/\)/gim, "\\)");
              TemRexgexArticleA = TemRexgexArticleA.replace(/\./gim, "\\.");
              if (c < articleArray.length - 1) {
                let TemRexgexArticleB = articleArray[c + 1];

                TemRexgexArticleB = articleArray[c + 1].replace(
                  /\\/gim,
                  "\\\\"
                );
                TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");
                let replace = `(?<=${TemRexgexArticleA}\n)(.*\n)*(?=${TemRexgexArticleB})`;
                let re = new RegExp(replace, "gim");
                point = ContentInEachChapter[0].match(re);
              } else {
                let TemRexgexArticleB = articleArray[c];

                TemRexgexArticleB = articleArray[c].replace(/\\/gim, "\\\\");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");
                let replace = `((?<=${TemRexgexArticleB}))((\n.*)*)$`;
                let re = new RegExp(replace, "gim");
                point = ContentInEachChapter[0].match(re);
              }
              let e;
              if (point) {
                e = point[0].replace(/\n+$/, "");
                e = e.replace(/^\n+/, "");
              } else {
                e = "";
              }

              data[a][sectionArray[a]][b][chapterArray[b]].push({
                [articleArray[c]]: e,
              });
            }
          }
        } else {
          // nếu mà trong 'phần thứ...' không có chương

          articleArray = ContentInEachSection[0].match(
            /^(Điều|Điều) \d+(.*)$/gim
          );

          data[a] = {};
          data[a][sectionArray[a]] = [];

          articleArray = RemoveNoOrder(articleArray);
          for (let b = 0; b < articleArray.length; b++) {
            // lỡ mà trong 'Điều ...' có dấu ngoặc ),( thì phải thêm \),\(
            // nếu không vì khi lấy nội dung của khoản sẽ bị lỗi

            let TemRexgexArticleA = articleArray[b];

            TemRexgexArticleA = articleArray[b].replace(/\\/gim, "\\\\");
            TemRexgexArticleA = TemRexgexArticleA.replace(/\(/gim, "\\(");
            TemRexgexArticleA = TemRexgexArticleA.replace(/\)/gim, "\\)");
            TemRexgexArticleA = TemRexgexArticleA.replace(/\./gim, "\\.");
            if (b < articleArray.length - 1) {
              let TemRexgexArticleB = articleArray[b + 1];

              TemRexgexArticleB = articleArray[b + 1].replace(/\\/gim, "\\\\");
              TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
              TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
              TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");

              let replace = `(?<=${TemRexgexArticleA}\n)(.*\n)*(?=${TemRexgexArticleB})`;
              let re = new RegExp(replace, "gim");
              point = ContentInEachSection[0].match(re);
            } else {
              let TemRexgexArticleB = articleArray[b];
              if (articleArray[b].match(/\(/gim)) {
                TemRexgexArticleB = articleArray[b].replace(/\\/gim, "\\\\");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
                TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");
              }

              let replace = `(?<=${TemRexgexArticleB}\n)(.*\n)*.*$`;
              let re = new RegExp(replace, "igm");
              point = ContentInEachSection[0].match(re);
            }

            let e;

            if (point) {
              e = point[0].replace(/\n+$/, "");
              e = e.replace(/^\n+/, "");
            } else {
              e = "";
            }

            data[a][sectionArray[a]][b] = [];

            data[a][sectionArray[a]][b] = { [articleArray[b]]: e };
          }
        }
      }
      setTextForMachine(data);
    } else if (i10.match(/^(Điều|Điều) */i)) {
      /////////////////////////////////////////  // nếu chỉ có Điều ...
      let point;
      let articleArray = i10.match(/^(Điều|Điều) \d+(.*)$/gim);

      articleArray = RemoveNoOrder(articleArray);

      for (let c = 0; c < articleArray.length; c++) {
        let TemRexgexArticleA = articleArray[c];
        TemRexgexArticleA = articleArray[c].replace(/\\/gim, "\\\\");
        TemRexgexArticleA = TemRexgexArticleA.replace(/\(/gim, "\\(");
        TemRexgexArticleA = TemRexgexArticleA.replace(/\)/gim, "\\)");
        TemRexgexArticleA = TemRexgexArticleA.replace(/\./gim, "\\.");

        if (c < articleArray.length - 1) {
          let TemRexgexArticleB = articleArray[c + 1];

          TemRexgexArticleB = articleArray[c + 1].replace(/\\/gim, "\\\\");
          TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
          TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
          TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");

          let replace = `(?<=${TemRexgexArticleA}\n)(.*\n)*(?=${TemRexgexArticleB})`;
          let re = new RegExp(replace, "gim");
          point = i10.match(re);
        } else {
          let TemRexgexArticleB = articleArray[c];

          if (articleArray[c].match(/\(/gim)) {
            // mới thêm sau này xem có chạy được không
            TemRexgexArticleB = articleArray[c].replace(/\\/gim, "\\\\");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\(/gim, "\\(");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\)/gim, "\\)");
            TemRexgexArticleB = TemRexgexArticleB.replace(/\./gim, "\\.");
          }

          let replace = `(?<=${TemRexgexArticleB}\n)(.*\n)*.*$`;
          let re = new RegExp(replace, "gim");
          point = i10.match(re);
        }
        let e;
        if (point) {
          e = point[0].replace(/\n+$/, "");
          e = e.replace(/^\n+/, "");
        } else {
          e = "";
        }

        data[c] = { [articleArray[c]]: e };
      }
      setTextForMachine(data);
    }

    console.table("data", data);
    return data;
  }

  function addJSONFile() {
    let yearSign = parseInt(lawInfo["lawDaySign"].getYear()) + 1900;
    let lawNumberForPush =
      lawInfo["lawNumber"] +
      (!lawInfo["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
        ? "(" + yearSign + ")"
        : "");

    fetch("/api/changejsonfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lawInfo: lawInfo,
        lawNumber: lawNumberForPush,
      }),
    }).then((res) => {
      res.text();
      console.log("Push success!");
    });
  }

  function Push() {
    let yearSign = parseInt(lawInfoPush["lawDaySign"].getYear()) + 1900;
    let lawNumberForPush =
      lawInfoPush["lawNumber"] +
      (!lawInfoPush["lawNumber"].match(/(?<=\d\W)\d{4}/gim)
        ? "(" + yearSign + ")"
        : "");

    // CHANGE JSON FILE
    fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataLaw: textForMachine,
        lawInfo: lawInfoPush,
        lawNumber: lawNumberForPush,
        contentText: fullText,
      }),
    }).then((res) => {
      res.text();
      console.log("success");
    });
    console.log(lawNumberForPush);
  }

  function goToStartInput() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // lawRelatedRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function goToEndInput() {
    // inputArea.current?.scrollTo(0, 0);
    // console.log('inputArea.current.scrollHeight',inputArea.current.scrollHeight);

    // window.scrollTo({top:23602+inputArea.current.scrollHeight + lawRelatedRef.current.scrollHeight})

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function goToStartOutput() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToEndOutput() {
    window.scrollTo({ top: outputArea.current.scrollHeight - 300 });
  }

  async function copyContent() {
    const clipText = await navigator.clipboard.readText();
    setURL(clipText);
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
            width: "95%",
            paddingLeft: 5,
          }}
          id={styles.url}
          value={URL}
          onChange={(e) => setURL(e.target.value)}
        ></textarea>
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
            style={{ backgroundColor: "orange",marginBottom:40 }}
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
            onClick={() => convertContent()}
          >
            Get Content
          </button>
          <button
            className={styles.btb}
            style={{ backgroundColor: "red" }}
            onClick={() => Push()}
          >
            Push
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
