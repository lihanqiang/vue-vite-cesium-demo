/* eslint-disable */

/**
 * Created by Jack on 16/11/18.
 */

// deepObjectMerge
export function deepObjectMerge(FirstOBJ, SecondOBJ) {
  for (const key in SecondOBJ) {
    FirstOBJ[key] = FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
      ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key]) : FirstOBJ[key] = SecondOBJ[key]
  }
  return FirstOBJ
}
