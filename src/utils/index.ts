export interface NestedObject {
  [key: string]: any;
}

export function flattenObject(obj: NestedObject, prefix = ""): NestedObject {
  let flattened: NestedObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty.call(obj, key)) {
      if (Array.isArray(obj[key])) {
        // 如果属性的值是数组，则将数组展平后的键值对添加到展平对象中
        const flattenedArray = obj[key].reduce(
          (result: NestedObject, item: any, index: number) => {
            const arrayKey = `${prefix}${key}[${index}]`;
            result = { ...result, ...flattenObject({ [arrayKey]: item }) };
            return result;
          },
          {}
        );
        flattened = { ...flattened, ...flattenedArray };
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        // 如果属性的值是对象，则递归展平该对象，并在键上添加前缀
        const nestedFlattened = flattenObject(obj[key], `${prefix}${key}.`);
        flattened = { ...flattened, ...nestedFlattened };
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }
  }

  return flattened;
}

export function unFlattenObject(obj: NestedObject): NestedObject {
  const unFlattened: NestedObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty.call(obj, key)) {
      const keys = key.split(".");
      let currentObject: NestedObject = unFlattened;

      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        const isArrayKey = currentKey.match(/(.+)\[(\d+)\]$/);

        if (isArrayKey) {
          // 如果键是数组键，则提取数组键和索引
          const arrayKey = isArrayKey[1];
          const index = Number(isArrayKey[2]);

          if (!currentObject[arrayKey]) {
            currentObject[arrayKey] = [];
          }

          if (i === keys.length - 1) {
            // 如果是最后一个键，则将值添加到数组中
            currentObject[arrayKey][index] = obj[key];
          } else {
            // 如果不是最后一个键，则创建嵌套对象
            if (!currentObject[arrayKey][index]) {
              currentObject[arrayKey][index] = {};
            }
            currentObject = currentObject[arrayKey][index];
          }
        } else {
          if (i === keys.length - 1) {
            currentObject[currentKey] = obj[key];
          } else {
            if (!currentObject[currentKey]) {
              currentObject[currentKey] = {};
            }
            currentObject = currentObject[currentKey];
          }
        }
      }
    }
  }

  return unFlattened;
}
