import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let data = localStorage.getItem("data");
    data = JSON.parse(data);
    if (data?.token) {
      router.push("/vehicle");
    } else {
      router.push("/login");
    }
  }, [router]);
  return <div></div>;
}
