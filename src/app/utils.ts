import { ac, did, dq, rc } from "@/utils/dom";

export const displayError = (err = "") => {
  const el = did("errorMsg");
  if (err != "") {
    el.innerHTML = err;
  }
  rc(el, "d-none");
};

export const cameraStarted = () => {
  ac(did("errorMsg"), "d-none");
  did("webcam-caption").innerHTML = "on";

  const webcamControl = did("webcam-control");
  rc(webcamControl, "webcam-off");
  ac(webcamControl, "webcam-on");

  rc(dq(".webcam-container"), "d-none");

  // ac(did("wpfront-scroll-top-container"), "d-none");
  window.scrollTo(0, 0);
  document.body.style.overflowY = "hidden";
};

export const cameraStopped = (doScroll = false) => {
  ac(did("errorMsg"), "d-none");
  // rc(did("wpfront-scroll-top-container"), "d-none");

  const webcamControl = did("webcam-control");
  rc(webcamControl, "webcam-on");
  ac(webcamControl, "webcam-off");

  ac(dq(".webcam-container"), "d-none");

  did("webcam-caption").innerText = "Try it On";

  rc(dq(".md-modal"), "md-show");

  if (doScroll) {
    document.body.style.overflowY = "scroll";
  }
};

export const beforeTakePhoto = () => {
  ac(did("webcam-control"), "d-none");
  ac(did("cameraControls"), "d-none");
};
