import Image from "next/image";
import styles from "./page.module.css";
export const metadata = {
  title: "NextJS Law Tool",
};
export default function Home() {
  return (
    <div style={{width:'100%', display:'flex', justifyContent:'space-around',marginTop:40}}>
        <a
          href="/once"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding:10,
            backgroundColor:'gray',

          }}
        >
          Once
        </a>
        <a
          href="/all"
          target="_blank"
          rel="noopener noreferrer"
                  style={{
            padding:10,
            backgroundColor:'gray',

          }}
>
          All
        </a>
        <a
          href="/check"
          target="_blank"
          rel="noopener noreferrer"
                  style={{
            padding:10,
            backgroundColor:'gray',

          }}
>
          check
        </a>
    </div>
  );
}
