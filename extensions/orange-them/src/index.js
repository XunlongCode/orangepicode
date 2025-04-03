const fs = require("fs").promises;
// const getTheme = require("./theme");
const getClassicTheme = require("./classic/theme");
const getOrangeTheme = require("./orangeColor")
const getWhiteTheme = require("./whiteColor")

const getBlackTheme = require("./blackColor")





// const lightTheme = getClassicTheme({
// 	style: "light",
// 	name: "OrangePi White",
// });

const lightTheme = getWhiteTheme();
const darkTheme = getBlackTheme();
// const darkTheme = getClassicTheme({
// 	style: "dark",
// 	name: "OrangePi black",
// });

const orangePI_orange = getOrangeTheme();
console.log("lightDefaultTheme", lightTheme);

console.log("wo 来了");

// Write themes


fs.mkdir("./themes", { recursive: true })
	.then(() => Promise.all([
		fs.writeFile("./themes/orangepi-white.json", JSON.stringify(lightTheme, null, 2)),
		fs.writeFile("./themes/orangepi-black.json", JSON.stringify(darkTheme, null, 2)),
		fs.writeFile("./themes/orangepi-orange.json", JSON.stringify(orangePI_orange, null, 2)),
		// fs.writeFile("./themes/dark-default.json", JSON.stringify(darkDefaultTheme, null, 2)),
		// fs.writeFile("./themes/dark-high-contrast.json", JSON.stringify(darkHighContrastTheme, null, 2)),
		// fs.writeFile("./themes/dark-colorblind.json", JSON.stringify(darkColorblindTheme, null, 2)),
		// fs.writeFile("./themes/dark-dimmed.json", JSON.stringify(darkDimmedTheme, null, 2)),
		// fs.writeFile("./themes/light.json", JSON.stringify(lightTheme, null, 2)),
		// fs.writeFile("./themes/dark.json", JSON.stringify(darkTheme, null, 2)),
	]))
	.catch(() => process.exit(1))
