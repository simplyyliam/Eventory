import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

type Props = {
  value: string;
};

export const QRCode = ({ value }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 220,
      height: 220,

      data: value,

      dotsOptions: {
        color: "#111111",
        type: "rounded", //  modern look
      },

      cornersSquareOptions: {
        type: "extra-rounded",
      },

      cornersDotOptions: {
        type: "dot",
      },

    });

    if (ref.current) {
      ref.current.innerHTML = "";
      qr.append(ref.current);
    }
  }, [value]);

  return <div ref={ref} />;
};