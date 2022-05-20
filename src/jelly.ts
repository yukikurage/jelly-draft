export const createState = <T>(
  initialValue: T
): [Getter<T>, Setter<T>, Modifier<T>] => {
  // setter が呼ばれたときに実行されるべき関数の集合
  let dependencies = new Set<() => void>();
  let value = initialValue;

  const getter = (c: Context) => {
    // dependencies を渡す
    c && c.add(dependencies);
    return value;
  };
  const setter = (newValue: T) => {
    if (value === newValue) return;
    value = newValue;

    const dependenciesCopy = new Set(dependencies);

    dependenciesCopy.forEach((c) => c());
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
  let clearDependencies: () => void = () => {};

  const f = () => {
    const context = new Set<Set<() => void>>();
    const callback = effect(context);

    let dependency: () => void;

    clearDependencies = () => {
      context.forEach((dependencies) => dependencies.delete(dependency));
    };

    dependency = () => {
      if (callback) callback();
      clearDependencies();
      f();
    };

    context.forEach((dependencies) => {
      dependencies.add(dependency);
    });
  };
  f();

  createUnmountEffect(() => {
    clearDependencies();
  }); // component が unmount されたときに　effect　を解除

  return clearDependencies;
};

let onUnmountEffectTemps = new Set<() => void>();

export const createUnmountEffect = (effect: (c: Context) => void): void => {
  onUnmountEffectTemps.add(() => effect(undefined));
};

const runComponent = ({ component }: Component): [HTMLElement, () => void] => {
  const onUnmountEffectTempsSave = onUnmountEffectTemps;

  onUnmountEffectTemps = new Set();
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
  type: "component",
  component: () => {
    const internalComponent = fc(props);
    const res = internalComponent.component();
    return res;
  },
});

const createComponent = (f: () => HTMLElement): Component => ({
  type: "component",
  component: f,
});

// h("div", props, children)
const h = <P extends keyof HTMLElementTagNameMap = never>(
  tagName: P | ((/* props */) => Component),
  attributes: Partial<JSX.IntrinsicElements[P]>,
  ...children: (string | Getter<string> | Component | Getter<Component>)[]
): Component => {
  if (typeof tagName === "string") {
    // html component
    return createComponent(() => {
      const realElement = document.createElement(tagName);

      attributes &&
        Object.entries(attributes).forEach(([key, value]) => {
          if (key[0] === "o" && key[1] === "n") {
            // Value is a EventListener
            realElement.addEventListener(key.slice(2), (e) =>
              value(e, undefined)
            );
          } else {
            if (value instanceof Function) {
              // Value is a Getter
              createEffect((c) => {
                const v = value(c);
                realElement.setAttribute(key, value);
              });
            } else {
              realElement.setAttribute(key, value);
            }
          }
        });

      const childUnmountEffects = new Set<() => void>();

      children.map((child) => {
        if (child instanceof Function) {
          // Via Getter
          createEffect((s) => {
            const c = child(s);
            if (c instanceof Object) {
              // Getter<Component>
              const [node, onUnmount] = runComponent(c);
              childUnmountEffects.add(onUnmount);
              realElement.appendChild(node);
              return () => {
                onUnmount();
                childUnmountEffects.delete(onUnmount);
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
          if (child instanceof Object) {
            // Component
            const [node, onUnmount] = runComponent(child);
            childUnmountEffects.add(onUnmount);
            realElement.appendChild(node);
          } else {
            // string
            const node = document.createTextNode(child);
            realElement.appendChild(node);
          }
        }
      });

      createUnmountEffect(() => {
        childUnmountEffects.forEach((f) => f());
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
