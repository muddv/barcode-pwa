import './style.css'
import { initPWA } from './pwa.ts'
async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML =
    `
  <div id='container'>
      <video id="vid"></video>
      <button id="photoBtn">take picture</button>
      <button id="vidc">play/pause</button>

      <button id="detect">detect barcode</button>
<label>
from video
      <input id="from" type="checkbox" />
</label>
  <div id='value'></div>
      <canvas id="barcodeImg">
  <div
    id="pwa-toast"
    role="alert"
    aria-labelledby="toast-message"
  >
    <div class="message">
      <span id="toast-message"></span>
    </div>
    <div class="buttons">
        <button id="pwa-refresh" type="button">
          Reload
        </button>
        <button id="pwa-close" type="button">
          Close
        </button>
    </div>
  </div>
`

  function takePicture(width = 500, height = 500) {
    const canvas: HTMLCanvasElement = document.querySelector('#barcodeImg')!
    const video: HTMLVideoElement = document.querySelector('#vid')!
    const context = canvas.getContext("2d")!
    if (width && height) {
      canvas.width = width
      canvas.height = height
      context.drawImage(video, 0, 0, width, height)

      const data = canvas.toDataURL("image/png")
      canvas.setAttribute("src", data)
    } else {
      // clearPhoto()
      console.log("clear photo")
    }
  }


  const camera = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: {
      exact: "environment"
    }
  }
})
  const videoElement = document.querySelector<HTMLVideoElement>("#vid")!
  videoElement.srcObject = camera
  const videoControlButton = document.querySelector<HTMLDivElement>('#vidc')!

  void videoElement.play()
  let isPlaying = true
  videoControlButton.addEventListener('click', () => {
    isPlaying = !isPlaying
    if (!isPlaying) {
      videoElement.srcObject = null
    } else {
      videoElement.srcObject = camera
      void videoElement.play()
    }
  })

  const photoBtn = document.querySelector("#photoBtn")!
  photoBtn.addEventListener('click', () => {

    takePicture()
  })


  const detectBtn = document.querySelector("#detect")!
  detectBtn.addEventListener('click', () => {
    detectBarcode(false)
  })

  function detectBarcode(fromImage = true) {
    let imageEl: HTMLCanvasElement = document.querySelector("#barcodeImg")!
    if (!fromImage) {
      imageEl = document.querySelector("#vid")!
    }

    // check compatibility
    if (!("BarcodeDetector" in globalThis)) {
      console.log("Barcode Detector is not supported by this browser.");
    } else {
      console.log("Barcode Detector supported!");

      // create new detector
      // @ts-ignore
      const barcodeDetector = new BarcodeDetector({
        formats: ["code_39", "codabar", "ean_13"],
      });
      barcodeDetector
        .detect(imageEl)
        .then((barcodes: any) => {
          console.log('gets here', barcodes)
          barcodes.forEach((barcode: any) => {
            console.log(barcode.rawValue)
            const valueDiv = document.querySelector("#value")!
            valueDiv.textContent = "barcode value is:" + barcode.rawValue
          });
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }

  initPWA(app)
}
main()
