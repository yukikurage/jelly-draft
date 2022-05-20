import esbuild from "esbuild";
import liveServer from "live-server";
import { execSync } from "child_process";

(async () => {
  await esbuild
    .build({
      entryPoints: ["./src/index.tsx"],
      bundle: true,
      outdir: "dist",
      minify: false,
      sourcemap: "both",
      jsxFactory: "jelly.h",
      target: ["es2020"],
      watch: true,
      plugins: [
        {
          name: "TypeScriptDeclarationsPlugin",
          setup(build) {
            build.onEnd((result) => {
              if (result.errors.length > 0) return;
              execSync("tsc --emitDeclarationOnly --declaration");
            });
          },
        },
      ],
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });

  await liveServer.start({
    port: 3030,
    host: "localhost",
    root: "./dist",
    open: true,
    logLevel: 2,
  });
})();
