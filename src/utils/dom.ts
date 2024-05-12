/**
 * This file is there just cuz I am lazy to call big methods
 * @author <KarthikBharadwajS>
 */

/** document.getElementById and addEventListener */
export const d = <K extends keyof HTMLElementEventMap>(str: string | string[], type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void) => {
  if (Array.isArray(str)) {
    str.forEach((v) => evLis([document.getElementById(v)], type, listener));
  } else {
    evLis([document.getElementById(str)], type, listener);
  }
};

export const w = <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) =>
  window.addEventListener(type, listener, options);

/** Event Listener Helper */
export const evLis = <K extends keyof HTMLElementEventMap>(
  documents: HTMLElement[] | Element[] | NodeListOf<HTMLElement>,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  filterEl: string = null
) => {
  (documents as NodeListOf<Element>).forEach((d) => {
    if (!filterEl) {
      d.addEventListener(type, listener as EventListener);
      return;
    }

    if (d.tagName === filterEl.toUpperCase()) d.addEventListener(type, listener as EventListener);
  });
};

export const did = (id: string) => document.getElementById(id); // getEl by id
export const dq = (query: string) => document.querySelector<HTMLElement>(query); // query selector first matched
export const dqa = (query: string) => document.querySelectorAll<HTMLElement>(query); // query selector all
export const rc = (el: HTMLElement | Element, key: string) => el.classList.remove(key); // remove class
export const ac = (el: HTMLElement | Element, key: string) => el.classList.add(key); // add class
