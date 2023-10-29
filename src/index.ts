import { PoseEngine } from "@geenee/bodyprocessors";
import { Recorder } from "@geenee/armature";
import { OutfitParams } from "@geenee/bodyrenderers-common";
import { AvatarRenderer } from "./avatarrenderer";
// import * as fs from 'fs';
import "./index.css";


const fileUrl = 'https://ahmedlotfysuits.com/storage/app/public/product/suit-files/2023-10-24-6536ea5163e58.testext'; // Replace with the URL of the remote file
const destinationPath = 'output_file.testext'; // Replace with the local destination path

async function downloadAndSaveFile(fileUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error('Failed to download file. Status code:', response.status);
      return;
    }

    const fileData = await response.blob(); // Convert response data to Blob

    // Construct the relative path to your assets directory
    const relativePathToAssets = './public/' + fileName;

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(fileData);
    downloadLink.download = relativePathToAssets; // Use the relative path

    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href); // Clean up after the download
    document.body.removeChild(downloadLink);

    console.log('File downloaded and saved successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

//downloadAndSaveFile(fileUrl, destinationPath);




// import { readFileSync, writeFileSync } from 'fs';
// import { join } from 'path';
// var fs = require('browserify-fs');
 
// fs.mkdir('/home', function() {
//     fs.writeFile('/home/hello-world.txt', 'Hello world!\n', function() {
//         fs.readFile('/home/hello-world.txt', 'utf-8', function(err, data) {
//             console.log(data);
//         });
//     });
// });
// var ss ;
// fetch("https://ahmedlotfysuits.com/api/v4/token_with_file/42").then(res => res.json()).then(data =>
//     fetch(data.file, {
//         mode:'no-cors'
//     }).then(response => response.blob()).then(
//         blob => {
//             let blobUrl = window.URL.createObjectURL(blob);
//             let a = document.createElement('a');
//             a.download = data.file
//             a.href = blobUrl;
//             document.body.appendChild(a)
//             console.log(a.localName)
//             a.click()
//             a.remove()
//         }
//     )
//  )
// function downloadImage(url) {
//     fetch(url, {
//         mode:'no-cors'
//     }).then(response => response.blob()).then(
//         blob => {
//             let blobUrl = window.URL.createObjectURL(blob);
//             let a = document.createElement('a');
//             a.download = url
//             a.href = blobUrl;
//             document.body.appendChild(a)
//             a.click()
//             a.remove()
//         }
//     )
// }
// Engine
const engine = new PoseEngine();
const token = location.hostname === "localhost" ?
    "l8vd8BEZ0y2AwDOZJ8JoiGt0JI8YN_jx" : "0Z5FsOvFh_eUMORg00J167xogPRSut5c";

// Parameters
const urlParams = new URLSearchParams(window.location.search);
let rear = urlParams.has("rear");
// Model map
const modelMap: {
    [key: string]: {
        file: string, avatar: boolean,
        outfit?: OutfitParams
    }
} = {
    // wolf: {
    //     file: "onesie1.glb", avatar: false,
    //     outfit: {
    //         occluders: [/Head$/, /Body/],
    //         hidden: [/Eye/, /Teeth/, /Footwear/]
    //     }
    // },
    shirt: {
        file: "https://fastupload.io/WII9rYiksSXp/n6E3xon2xupUlHD/l5YzMql52zyOA/test.glb", avatar: false,
        outfit: {
            occluders: [/Head$/, /Body/]
        }
          
    },
       wolf: {
        file: "formal compressed2.glb", avatar: false,
                outfit: {
            occluders: [/Head$/, /Body/]
        }
    }

}
let model = "shirt";
let avatar = modelMap["shirt"].avatar;

// Create spinner element
// Create spinner element
function createSpinner() {
    const container = document.createElement("div");
    container.className = "spinner-container";
    container.id = "spinner";
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement("div");
        dot.className = "spinner-dot";
        spinner.appendChild(dot);
    }
    container.appendChild(spinner);
    return container;
}

async function main() {
    // Renderer
    const container = document.getElementById("root");
    if (!container)
        return;
    const renderer = new AvatarRenderer(
        container, "crop", !rear, modelMap[model].file,
        avatar ? undefined : modelMap[model].outfit);
    // Camera switch
    const cameraSwitch = document.getElementById(
        "camera-switch") as HTMLButtonElement | null;
    if (cameraSwitch) {
        cameraSwitch.onclick = async () => {
            cameraSwitch.disabled = true;
            rear = !rear;
            await engine.setup({ size: { width: 1920, height: 1080 }, rear });
            await engine.start();
            renderer.setMirror(!rear);
            cameraSwitch.disabled = false;
        }
    }
    // Outfit switch
    const outfitSwitch = document.getElementById(
        "outfit-switch") as HTMLInputElement;
    outfitSwitch.checked = avatar;
    outfitSwitch.onchange = async () => {
        modelBtns.forEach((btn) => { btn.disabled = true; })
        outfitSwitch.disabled = true;
        const spinner = createSpinner();
        document.body.appendChild(spinner);
        avatar = outfitSwitch.checked;
        await renderer.setOutfit(
            modelMap[model].file,
            avatar ? undefined : modelMap[model].outfit);
        document.body.removeChild(spinner);
        modelBtns.forEach((btn) => { btn.disabled = false; });
        outfitSwitch.disabled = false;
    }
    // Recorder
    const safari = navigator.userAgent.indexOf('Safari') > -1 &&
                   navigator.userAgent.indexOf('Chrome') <= -1
    const ext = safari ? "mp4" : "webm";
    const recorder = new Recorder(renderer, "video/" + ext);
    const recordButton = document.getElementById(
        "record") as HTMLButtonElement | null;
    if (recordButton)
        recordButton.onclick = () => {
            recorder?.start();
            setTimeout(async () => {
                const blob = await recorder?.stop();
                if (!blob)
                    return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.hidden = true;
                link.href = url;
                link.download = "capture." + ext;
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
            }, 10000);
        };
    // Model carousel
    const modelBtns = document.getElementsByName(
        "model") as NodeListOf<HTMLInputElement>;
    modelBtns.forEach((btn) => {
        btn.onchange = async () => {
            if (btn.checked && modelMap[btn.value]) {
                modelBtns.forEach((btn) => { btn.disabled = true; })
                outfitSwitch.disabled = true;
                const spinner = createSpinner();
                document.body.appendChild(spinner);
                model = btn.value;
                avatar = modelMap[model].avatar;
                await renderer.setOutfit(
                    modelMap[model].file,
                    avatar ? undefined : modelMap[model].outfit);
                outfitSwitch.checked = avatar;
                document.body.removeChild(spinner);
                modelBtns.forEach((btn) => { btn.disabled = false; });
                outfitSwitch.disabled = false;
            }
        };
    });
    // Initialization
    await Promise.all([
        engine.addRenderer(renderer),
        engine.init({ token: token })
    ]);
    await engine.setup({ size: { width: 1920, height: 1080 }, rear });
    await engine.start();
    document.getElementById("dots")?.remove();
}
main();