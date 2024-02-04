const fs = require('fs');

const copyFileToBuildRoot = (src: string) => {
  const fileName = src.split('/').pop();
  fs.copyFile(src, `./dist/ng2-gauge/${fileName}`, (err: unknown) => {
    if (err) {
      throw new Error(`Unable to copy ${fileName}`);
    }
  });
};

console.log('Copying additional files to the dist folder ...');

copyFileToBuildRoot('./README.md');
copyFileToBuildRoot('./CHANGELOG.md');

console.log('Done!');
