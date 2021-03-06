import * as React from "react";

const SvgBubbleTea = (props) => {
  return (
    <svg
      height={512}
      width={512}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <circle cx={320} cy={440} r={8} />
      <circle cx={296} cy={384} r={8} />
      <circle cx={216} cy={384} r={8} />
      <circle cx={256} cy={440} r={8} />
      <path d="M224 176h-87.59l2.4 48H224zM400 152a8.009 8.009 0 00-8-8H120a8.009 8.009 0 00-8 8v8h288zM240 176h32v48h-32zM288 224h85.19l2.4-48H288zM149.71 442a39.97 39.97 0 0039.95 38h132.68a39.969 39.969 0 0039.95-38l10.1-202H139.61zM344 440a24 24 0 11-24-24 24.028 24.028 0 0124 24zm-48-80a24 24 0 11-24 24 24.028 24.028 0 0124-24zm-16 80a24 24 0 11-24-24 24.027 24.027 0 0124 24zm-64-80a24 24 0 11-24 24 24.027 24.027 0 0124-24zm-24 56a24 24 0 11-24 24 24.027 24.027 0 0124-24zM240 32h32v96h-32z" />
      <circle cx={192} cy={440} r={8} />
    </svg>
  );
};

export default SvgBubbleTea;
