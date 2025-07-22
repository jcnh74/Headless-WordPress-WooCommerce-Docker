import Image from "next/image";
// import styles from "./page.module.css";
import PostList from "./components/PostList";

export default function Home() {
  return (
    <main>
      <Image
        className="logo"
        src="/logo.svg"
        alt="Vagabond Cafe logo"
        width={180}
        height={38}
        priority
      />
      <PostList />
    </main>
  );
}
