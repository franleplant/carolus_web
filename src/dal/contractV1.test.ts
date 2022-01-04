import { calcPaging } from "./contractV1";

test("Calc Paging", () => {
  const supply = 22;
  expect(calcPaging(supply, 0, 5)).toEqual([21, 20, 19, 18, 17]);
  expect(calcPaging(supply, 1, 5)).toEqual([16, 15, 14, 13, 12]);
  expect(calcPaging(supply, 2, 5)).toEqual([11, 10, 9, 8, 7]);
  expect(calcPaging(supply, 3, 5)).toEqual([6, 5, 4, 3, 2]);
  expect(calcPaging(supply, 4, 5)).toEqual([1, 0]);
  expect(() => calcPaging(supply, 5, 5)).toThrow();
});
