import katex from "katex";

/**
 * Inline math:  <K>{"\\frac{x}{y}"}</K>
 * Display math: <K d>{"\\frac{x}{y}"}</K>
 */
export const K = ({ children, d }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(children, {
        displayMode: !!d,
        throwOnError: false,
      }),
    }}
    style={d ? { display: "block", margin: "14px 0", textAlign: "center" } : undefined}
  />
);
