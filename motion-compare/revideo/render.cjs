const { renderVideo } = require("@revideo/renderer");

const outFile = process.env.OUT_FILE || "03-revideo.mp4";
const outDir = process.env.OUT_DIR || "/workspace/motion-compare/outputs";

renderVideo({
  projectFile: process.env.PROJECT_FILE || "./src/project.ts",
  settings: {
    outFile,
    outDir,
    workers: 1,
    logProgress: true,
    puppeteer: {
      executablePath: process.env.CHROME_PATH,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--single-process",
        "--allow-file-access-from-files",
      ],
    },
  },
})
  .then((file) => {
    console.log("DONE:", file);
    process.exit(0);
  })
  .catch((err) => {
    console.error("RENDER FAILED:", err);
    process.exit(1);
  });
