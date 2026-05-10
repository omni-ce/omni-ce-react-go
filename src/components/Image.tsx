import React from "react";

import { HOST_API } from "@/environment";

interface ImageProps extends React.ComponentProps<"img"> {
  src: string;
  alt: string;
  className?: string;
}

export default function Image({ src, alt, className, ...props }: ImageProps) {
  if (!src.startsWith("http")) {
    src = HOST_API + src;
  }
  return <img src={src} alt={alt} className={className} {...props} />;
}
