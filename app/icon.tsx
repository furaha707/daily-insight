import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 헤더 워드마크와 동일한 Blacksword 폰트로 "D" 한 글자만 딴 파비콘.
export default function Icon() {
  const blacksword = readFileSync(
    join(process.cwd(), "app/fonts/Blacksword.otf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B1613",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: "Blacksword",
            fontSize: 26,
            color: "#E0693C",
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Blacksword", data: blacksword, style: "normal" }],
    }
  );
}
