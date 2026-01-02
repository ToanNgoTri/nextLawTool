"use client";
import Image from "next/image";
import styles from "./page.module.css";
// import lawObject from "./asset/LawMachine.LawCollection.json";
import lawID1 from "./asset/allLawID.json";
import lawID2 from "./asset/allLawID copy.json";
import { compareLaw } from "./main.js";

export default function Home() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        marginTop: 40,
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          marginTop: 40,
        }}
      >
        <a
          href="/once"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          Once
        </a>
        <a
          href="/all"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          All
        </a>
        <a
          href="/check"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          Check
        </a>
        <a
          href="/api/getlawid"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          GetlawID
        </a>
        <button onClick={() => compareLaw(lawID1, lawID2)}>CompareLaw</button>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          marginTop: 40,
        }}
      >
        <a
          href="/api/population"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          population
        </a>
        <a
          href="/api/lawcollection"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          LawCollection
        </a>
        <a
          href="/api/lawsearchcontent"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          LawSearchContent
        </a>
        <a
          href="/api/lawobjnew"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          lawObjNew
        </a>
        <a
          href="/api/lawsearchdescription"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: 10,
            backgroundColor: "gray",
          }}
        >
          LawSearchDescription
        </a>
      </div>
    </div>
  );
}
