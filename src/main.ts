import './style.css'
import { initPWA } from './pwa.ts'
let paused = false
async function main() {

  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML =
    `
  <div id='container'>
      <canvas id="barcodeImg"></canvas>
      <button id="vidc">play/pause</button>

      <button id="detect">detect barcode</button>
<label>
from video
      <input id="from" type="checkbox" />
</label>
  <div id='value'></div>

      <video id="vid"></video>
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



  let camera: MediaStream
  try {
    camera = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          exact: "environment"
        }
      }
    })
  } catch (e) {
    if (e instanceof OverconstrainedError) {
      camera = await navigator.mediaDevices.getUserMedia({
        video: true
      })
    } else {
      console.error(e)
    }
  }
  const videoElement = document.querySelector<HTMLVideoElement>("#vid")!
  videoElement.srcObject = camera!
  const videoControlButton = document.querySelector<HTMLDivElement>('#vidc')!

  void videoElement.play()
  let isPlaying = true
  videoControlButton.addEventListener('click', () => {
    if (paused === true) {
      paused = false
      drawVideoOnCanvas()
      barcodeDetectionLoop()
      return
    }
    isPlaying = !isPlaying
    if (!isPlaying) {
      videoElement.srcObject = null
    } else {
      videoElement.srcObject = camera
      void videoElement.play()
    }
  })


  function detectBarcode(fromImage = true) {
    let imageEl: HTMLCanvasElement = document.querySelector("#barcodeImg")!
    if (!fromImage) {
      imageEl = document.querySelector("#vid")!
    }

    // check compatibility
    if (!("BarcodeDetector" in globalThis)) {
      console.log("Barcode Detector is not supported by this browser.")
    } else {
      // create new detector
      // @ts-ignore
      const barcodeDetector = new BarcodeDetector({
        formats: [
          "aztec",
          "code_128",
          "code_39",
          "code_93",
          "codabar",
          "data_matrix",
          "ean_13",
          "ean_8",
          "itf",
          "pdf417",
          "qr_code",
          "upc_a",
          "upc_e",
          "unknown"
        ],
      });
      barcodeDetector
        .detect(imageEl)
        .then((barcodes: any) => {
          barcodes.forEach((barcode: any) => {
            onBarcodeDetected(barcode)
          })
        })
        .catch((err: any) => {
          console.log(err)
        });
    }
  }

  initPWA(app)
  function drawVideoOnCanvas(width = 500, height = 500) {
    const canvas: HTMLCanvasElement = document.querySelector('#barcodeImg')!
    const video: HTMLVideoElement = document.querySelector('#vid')!
    const context = canvas.getContext("2d")!
    canvas.width = width
    canvas.height = height
    const drawLoop = () => {
      context.drawImage(video, 0, 0, width, height)
      if (!paused) {
        requestAnimationFrame(drawLoop)
      }
    }
    requestAnimationFrame(drawLoop)
  }
  drawVideoOnCanvas()

  let timeOut = 600
  const barcodeDetectionLoop = () => {
    setTimeout(() => {
      detectBarcode()
      timeOut = 600
      barcodeDetectionLoop()
    }, timeOut)
  }
  barcodeDetectionLoop()
}
main()

function onBarcodeDetected(barcode: any) {
  paused = true
  const valueDiv = document.querySelector("#value")!
  valueDiv.textContent = "barcode value is:" + barcode.rawValue
  paintBarcodeBoundingBox(barcode)
}

function paintBarcodeBoundingBox(barcode: any) {
  console.log(barcode)
  const canvas: HTMLCanvasElement = document.querySelector('#barcodeImg')!
  const context = canvas.getContext("2d")!
  const bb = barcode.boundingBox
  console.log("!!!!!", bb)
  context.beginPath()

  context.strokeStyle = '#ff0000'
  context.rect(bb.x, bb.y, bb.width, bb.height)
  context.stroke()

  // const data = context.getImageData(0, 0, width, height)
  // const imageData = data.data

  // for (let i = 0; i < imageData.length; i += 4) {
  //   imageData[i] = 10000000
  // }
  // context.putImageData(data, 0, 0)
}
