// Function to parse the CSS values
export const parseCSSValue = (element: HTMLElement | Element, property: string) => {
  return parseInt(window.getComputedStyle(element, null).getPropertyValue(property));
};
