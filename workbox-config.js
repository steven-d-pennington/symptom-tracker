module.exports = {
  globDirectory: "out",
  globPatterns: ["**/*.{html,js,css,svg,png,woff2}"],
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
};
