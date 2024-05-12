type MediaDeviceKind = "videoinput" | "audioinput" | "audiooutput";

interface MediaDevice {
  kind: MediaDeviceKind;
  label: string;
  deviceId: string;
}

export default class Webcam {
  private _webcamElement: HTMLVideoElement;
  private _facingMode: string;
  private _webcamList: MediaDevice[];
  private _streamList: MediaStream[];
  private _selectedDeviceId: string;
  private _canvasElement: HTMLCanvasElement | null;
  private _snapSoundElement: HTMLMediaElement | null;

  constructor(webcamElement: HTMLVideoElement, facingMode: string = "user", canvasElement: HTMLCanvasElement = null, snapSoundElement: HTMLMediaElement = null) {
    this._webcamElement = webcamElement;
    this._webcamElement.width = this._webcamElement.width || 640;
    this._webcamElement.height = this._webcamElement.height || 360;
    this._facingMode = facingMode;
    this._webcamList = [];
    this._streamList = [];
    this._selectedDeviceId = "";
    this._canvasElement = canvasElement;
    this._snapSoundElement = snapSoundElement;
  }

  get facingMode(): string {
    return this._facingMode;
  }

  set facingMode(value: string) {
    this._facingMode = value;
  }

  get webcamList(): MediaDevice[] {
    return this._webcamList;
  }

  get webcamCount(): number {
    return this._webcamList.length;
  }

  get selectedDeviceId(): string {
    return this._selectedDeviceId;
  }

  /* Get all video input devices info */
  getVideoInputs(mediaDevices: MediaDeviceInfo[]): MediaDevice[] {
    this._webcamList = mediaDevices.filter((device) => device.kind === "videoinput") as MediaDevice[];
    if (this._webcamList.length === 1) {
      this._facingMode = "user";
    }
    return this._webcamList;
  }

  /* Get media constraints */
  getMediaConstraints(): MediaStreamConstraints {
    const videoConstraints: any = this._selectedDeviceId ? { deviceId: { exact: this._selectedDeviceId } } : { facingMode: this._facingMode };
    videoConstraints.width = { exact: this._webcamElement.width };
    videoConstraints.height = { exact: this._webcamElement.height };

    return {
      video: videoConstraints,
      audio: false,
    };
  }

  /* Select camera based on facingMode */
  selectCamera(): void {
    this._webcamList.some((webcam) => {
      if ((this._facingMode === "user" && webcam.label.toLowerCase().includes("front")) || (this._facingMode === "environment" && webcam.label.toLowerCase().includes("back"))) {
        this._selectedDeviceId = webcam.deviceId;
        return true;
      }
      return false;
    });
  }

  /* Change Facing mode and selected camera */
  flip(): void {
    this._facingMode = this._facingMode === "user" ? "environment" : "user";
    this._webcamElement.style.transform = "";
    this.selectCamera();
  }

  /*
    1. Get permission from user
    2. Get all video input devices info
    3. Select camera based on facingMode 
    4. Start stream
  */
  async start(startStream = true) {
    return new Promise((resolve, reject) => {
      this.stop();
      navigator.mediaDevices
        .getUserMedia(this.getMediaConstraints()) //get permisson from user
        .then((stream) => {
          this._streamList.push(stream);
          this.info() //get all video input devices info
            .then((webcams) => {
              this.selectCamera(); //select camera based on facingMode
              if (startStream) {
                this.stream()
                  .then((facingMode) => {
                    resolve(this._facingMode);
                  })
                  .catch(reject);
              } else {
                resolve(this._selectedDeviceId);
              }
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /* Get all video input devices info */
  async info(): Promise<MediaDevice[]> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.getVideoInputs(devices);
          resolve(this._webcamList);
        })
        .catch(reject);
    });
  }

  /* Start streaming webcam to video element */
  async stream(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia(this.getMediaConstraints())
        .then((stream) => {
          this._streamList.push(stream);
          this._webcamElement.srcObject = stream;
          if (this._facingMode == "user") {
            this._webcamElement.style.transform = "scale(-1,1)";
          }
          this._webcamElement.play();
          resolve(this._facingMode);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /* Stop streaming webcam */
  stop() {
    this._streamList.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
  }

  snap() {
    if (this._canvasElement != null) {
      if (this._snapSoundElement != null) {
        this._snapSoundElement.play();
      }
      this._canvasElement.height = this._webcamElement.scrollHeight;
      this._canvasElement.width = this._webcamElement.scrollWidth;
      let context = this._canvasElement.getContext("2d");
      if (this._facingMode == "user") {
        context.translate(this._canvasElement.width, 0);
        context.scale(-1, 1);
      }
      context.clearRect(0, 0, this._canvasElement.width, this._canvasElement.height);
      context.drawImage(this._webcamElement, 0, 0, this._canvasElement.width, this._canvasElement.height);
      let data = this._canvasElement.toDataURL("image/png");
      return data;
    } else {
      throw "canvas element is missing";
    }
  }
}
