import Image from "next/image";
import styles from "./page.module.css";
import Btbcheck from './btbcheck'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>

        {/* <form action="/URL" method="get"> */}

        <Btbcheck/>
        {/* </form> */}
        </div>
      </main>
      <footer className={styles.footer}>
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
