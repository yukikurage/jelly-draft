export type Context = () => void;
export type Getter<T> = (c: Context) => T;
export type Setter<T> = (value: T) => void;
export type Modifier<T> = (modify: (prev: T) => T) => void;

const getters = new WeakSet();

export const createState = <T>(
  initialValue: T
): [Getter<T>, Setter<T>, Modifier<T>] => {
  // setter が呼ばれたときに実行されるべき関数の集合
  let dependencies = new Set<() => void>();
  let value = initialValue;

  const getter = (c: () => void) => {
    // dependencies に追加
    dependencies.add(c);
    console.log(
      "getter called. dependencies size:",
      dependencies.size,
      ", value:",
      value
    );
    return value;
  };

  getters.add(getter);

  const setter = (newValue: T) => {
    const oldDependencies = dependencies;
    dependencies = new Set();
    if (value === newValue) return;
    value = newValue;
    oldDependencies.forEach((c) => c());
    console.log(
      "setter called. dependencies size:",
      dependencies.size,
      ", value:",
      value
    );
  };

  const modifier = (modify: (prev: T) => T) => {
    const newValue = modify(value);
    setter(newValue);
  };

  return [getter, setter, modifier];
};

export const isGetter = (v: any): v is Getter<any> => getters.has(v);

export const convertToGetter = <T>(value: T | Getter<T>): Getter<T> => {
  if (isGetter(value)) return value;
  return () => value;
};

export const convertFromGetter = <T>(c: Context, value: Getter<T> | T): T => {
  if (isGetter(value)) {
    return value(c);
  }
  return value;
};

export const createEffect = (
  effect: (c: () => void) => (() => void) | void
) => {
  const f = () => {
    let callback: (() => void) | void;
    let c = () => {
      if (callback) callback();
      f();
    };
    callback = effect(c);
  };
  f();
};

// h("div", props, children)
const h = (
  tagName: keyof HTMLElementTagNameMap | ((/* attributes */) => HTMLElement),
  attributes: { [key: string]: string },
  ...children: (string | HTMLElement | Getter<string | HTMLElement>)[]
): HTMLElement => {
  if (typeof tagName === "string") {
    const realElement = document.createElement(tagName);
    children.map((child) => {
      if (typeof child === "function") {
        createEffect((s) => {
          const c = child(s);

          let node: Node;
          if (c instanceof HTMLElement) {
            node = c;
          } else {
            node = document.createTextNode(c);
          }
          realElement.appendChild(node);
          return () => {
            realElement.removeChild(node);
          };
        });
      } else {
        if (child instanceof Node) {
          realElement.appendChild(child);
        } else {
          realElement.appendChild(document.createTextNode(child));
        }
      }
    });
    return realElement;
  } else {
    return tagName();
  }
};

export const render = (parent: HTMLElement, component: HTMLElement) => {
  parent.appendChild(component);
};

export default {
  h,
};
