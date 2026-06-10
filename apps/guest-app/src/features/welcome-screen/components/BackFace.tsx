export const BackFace = () => {
    return (
          <div
    className="absolute inset-0"
    style={{
      transform: "rotateY(180deg)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    <svg
      width="330"
      height="504"
      viewBox="0 0 360 504"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0"
    >
      <defs>
        <clipPath id="postcard-back-clip">
          <path d="M15 7.5L0 0L7.5 14.49L0 28.98L7.5 43.52L0 58.01L7.5 72.5L0 86.99L7.5 101.48L0 115.97L7.5 130.46L0 144.95L7.5 159.44L0 173.93L7.5 188.43L0 202.92L7.5 217.41L0 231.9L7.5 246.39L0 260.88L7.5 275.37L0 289.86L7.5 304.35L0 318.84L7.5 333.33L0 347.82L7.5 362.31L0 376.8L7.5 391.3L0 405.79L7.5 420.28L0 434.77L7.5 449.26L0 464L15 456.96L30 464L45 456.96L60 464L75 456.96L90 464L105 456.96L120 464L135 456.96L150 464L165 456.96L180 464L195 456.96L210 464L225 456.96L240 464L255 456.96L270 464L285 456.96L300 464L315 456.96L330 464L345 456.96L360 464L352.5 449.26L360 434.77L352.5 420.28L360 405.79L352.5 391.3L360 376.8L352.5 362.31L360 347.82L352.5 333.33L360 318.84L352.5 304.35L360 289.86L352.5 275.37L360 260.88L352.5 246.39L360 231.9L352.5 217.41L360 202.92L352.5 188.43L360 173.93L352.5 159.44L360 144.95L352.5 130.46L360 115.97L352.5 101.48L360 86.99L352.5 72.5L360 58.01L352.5 43.52L360 28.98L352.5 14.49L360 0L345 7.5L330 0L315 7.5L300 0L285 7.5L270 0L255 7.5L240 0L225 7.5L210 0L195 7.5L180 0L165 7.5L150 0L135 7.5L120 0L105 7.5L90 0L75 7.5L60 0L45 7.5L30 0L15 7.5Z" />
        </clipPath>
      </defs>

      <rect
        width="360"
        height="464"
        fill="#ffffff"
        clipPath="url(#postcard-back-clip)"
      />

      <foreignObject x="20" y="15" width="320" height="434">
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-full h-full bg-[url('/rose.jpg')] bg-cover bg-center"></div>
        </div>
      </foreignObject>
    </svg>
  </div>
    )
}