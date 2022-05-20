export type Context = Set<Set<() => void>>;
export type Getter<T> = (c: Context) => T;
export type Setter<T> = (value: T) => void;
export type Modifier<T> = (modify: (prev: T) => T) => void;
export type TypeCreateEffect = (
  effect: (c: Context) => (() => void) | void
) => void;

export const createState = <T>(
  initialValue: T
): [Getter<T>, Setter<T>, Modifier<T>] => {
  // setter が呼ばれたときに実行されるべき関数の集合
  let dependencies = new Set<() => void>();
  let value = initialValue;

  const getter = (c: Set<Set<() => void>>) => {
    // dependencies を渡す
    c.add(dependencies);
    console.log(
      "getter called. dependencies size:",
      dependencies.size,
      ", value:",
      value
    );
    return value;
  };
  const setter = (newValue: T) => {
    if (value === newValue) return;
    value = newValue;

    const dependenciesCopy = new Set(dependencies);

    dependenciesCopy.forEach((c) => c());
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

export const createEffect = (
  effect: (c: Context) => (() => void) | void
): (() => void) => {
  const context = new Set<Set<() => void>>();
  const callback = effect(context);

  const clearDependencies = () =>
    context.forEach((dependencies) => dependencies.delete(dependency));

  const dependency = () => {
    if (callback) callback();
    clearDependencies();
    createEffect(effect);
  };

  context.forEach((dependencies) => {
    dependencies.add(dependency);
  });

  createUnmountEffect(clearDependencies); // component が unmount されたときに　effect　を解除

  return clearDependencies;
};

let onUnmountEffectTemps = new Set<() => void>();

export const createUnmountEffect = (effect: (c: Context) => void): void => {
  const context = new Set<Set<() => void>>();

  onUnmountEffectTemps.add(() => effect(context));
};

const componentSymbol = Symbol("component");

type Component = {
  [componentSymbol]: true;
  component: () => HTMLElement;
};

const isComponent = (x: any): x is Component => x && x[componentSymbol];

const runComponent = ({ component }: Component): [HTMLElement, () => void] => {
  const onUnmountEffectTempsSave = new Set(onUnmountEffectTemps);

  onUnmountEffectTemps.clear();
  const res = component();

  const onUnmountEffectTempsCopy = onUnmountEffectTemps;
  onUnmountEffectTemps = onUnmountEffectTempsSave;

  const onUnmountEffect = () => {
    onUnmountEffectTempsCopy.forEach((f) => f());
  };

  return [res, onUnmountEffect];
};

const createComponentFromFunctionalComponent = <T>(
  fc: (props: T) => Component,
  props: T
): Component => ({
  [componentSymbol]: true,
  component: () => {
    const internalComponent = fc(props);
    return internalComponent.component();
  },
});

const createComponent = (f: () => HTMLElement): Component => ({
  [componentSymbol]: true,
  component: f,
});

// h("div", props, children)
const h = (
  tagName: keyof HTMLElementTagNameMap | ((/* props */) => Component),
  attributes: { [key: string]: string | (() => void) },
  ...children: (string | Getter<string> | Component | Getter<Component>)[]
): Component => {
  if (typeof tagName === "string") {
    // html component
    return createComponent(() => {
      const realElement = document.createElement(tagName);

      attributes &&
        Object.entries(attributes).forEach(([key, value]) => {
          if (value instanceof Function) {
            realElement.addEventListener(key.slice(2), value);
          } else {
            realElement.setAttribute(key, value);
          }
        });

      children.map((child) => {
        if (child instanceof Function) {
          // Via Getter
          createEffect((s) => {
            const c = child(s);
            if (isComponent(c)) {
              // Getter<Component>
              const [node, onUnmount] = runComponent(c);
              createUnmountEffect(onUnmount);
              realElement.appendChild(node);
              return () => {
                onUnmount();
                realElement.removeChild(node);
              };
            } else {
              // Getter<string>
              const node = document.createTextNode(c);
              realElement.appendChild(node);
              return () => {
                realElement.removeChild(node);
              };
            }
          });
        } else {
          // string or Component
          if (isComponent(child)) {
            // Component
            const [node, onUnmount] = runComponent(child);
            createUnmountEffect(onUnmount);
            realElement.appendChild(node);
          } else {
            // string
            const node = document.createTextNode(child);
            realElement.appendChild(node);
          }
        }
      });

      return realElement;
    });
  } else {
    // functional Component
    return createComponentFromFunctionalComponent(tagName, attributes);
  }
};

export const render = (parent: HTMLElement, component: Component) => {
  const [node] = runComponent(component);
  parent.appendChild(node);
};

export default {
  h,
};
