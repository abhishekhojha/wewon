"use client";

import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    console.error("CLIENT EXECUTED");
    console.log("CLIENT EXECUTED");
    console.warn("CLIENT EXECUTED");
    console.info("CLIENT EXECUTED");
    document.body.style.background = "red";
    alert("RUNNING");
  }, []);

  return <>hello</>;
}