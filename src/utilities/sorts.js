/**
 * Created by trungquandev.com's author on 03/28/2021
 * ---
 * Order an array of objects based on another array order
 * ---
 */
export const mapOrder = (array, order, key) => {
  array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]))
  return array
}
