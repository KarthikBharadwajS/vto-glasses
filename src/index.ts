import { d, dqa, evLis, w } from "./utils/dom";
import { onArrowLeftClicked, onArrowRightClicked, onCloseError, onItemClicked, onWebcamSwitch } from "./app";
import { onLoad } from "./app/dom/window-events";

/** Window Events */
w("load", onLoad, { passive: true });

/** VTO */
d("webcam-switch", "change", onWebcamSwitch);
d("arrowLeft", "click", onArrowLeftClicked);
d("arrowRight", "click", onArrowRightClicked);

evLis(dqa("#glasses-list ul li"), "click", onItemClicked, "li");
d("closeError", "click", onCloseError);
