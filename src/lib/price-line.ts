import { priceParts, struckPrice } from './format';

// In the browser: shows another price in a PriceLine.astro, with the price
// before a drop struck through and "Vừa giảm", or without them.

export function paintPriceLine(line: Element, vnd: number, was?: number) {
  const [num, unit] = priceParts(vnd);
  line.querySelector('[data-num]')!.textContent = num;
  line.querySelector('[data-unit]')!.textContent = unit;
  line.toggleAttribute('data-drop', was !== undefined);
  if (was !== undefined) line.querySelector('[data-was-text]')!.textContent = struckPrice(was);
}
