"use client";

import Image from "next/image";
import { useState } from "react";

export default function ItemThumb({ src, name }) {
  const [err, setErr] = useState(false);

  if (err || !src) {
    return (
      <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-500 text-xs">
        BJ
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes="64px"
      className="object-cover"
      onError={() => setErr(true)}
    />
  );
}
