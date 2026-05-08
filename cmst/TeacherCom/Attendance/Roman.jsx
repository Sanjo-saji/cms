// components/common/Roman.js
import { Text } from "react-native";

const toRoman = (num) => {
  if (typeof num !== "number") num = parseInt(num, 10);
  if (isNaN(num) || num <= 0 || num >= 4000) return "";

  const romanMap = [
    { val: 1000, sym: "M" },
    { val: 900, sym: "CM" },
    { val: 500, sym: "D" },
    { val: 400, sym: "CD" },
    { val: 100, sym: "C" },
    { val: 90, sym: "XC" },
    { val: 50, sym: "L" },
    { val: 40, sym: "XL" },
    { val: 10, sym: "X" },
    { val: 9, sym: "IX" },
    { val: 5, sym: "V" },
    { val: 4, sym: "IV" },
    { val: 1, sym: "I" },
  ];

  let result = "";
  for (let { val, sym } of romanMap) {
    while (num >= val) {
      result += sym;
      num -= val;
    }
  }
  return result;
};

const Roman = ({ number, style }) => {
  return <Text style={style}>{toRoman(number)}</Text>;
};

export default Roman;
