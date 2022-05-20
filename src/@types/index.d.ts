declare type Context = Set<Set<() => void>> | undefined;

declare type Getter<T> = (c: Context) => T;

declare type Setter<T> = (value: T) => void;

declare type Modifier<T> = (modify: (prev: T) => T) => void;

declare type TypeCreateEffect = (
  effect: (c: Context) => (() => void) | void
) => void;

declare type Component = {
  type: "component";
  component: () => HTMLElement;
};
declare namespace JSX {
  export type Element = Component;

  export type IntrinsicElements = {
    [P in keyof HTMLElementTagNameMap]: Partial<{
      [K in keyof HTMLElementTagNameMap[P]]: K extends `on${infer E}`
        ? E extends keyof HTMLElementEventMap
          ? (e: HTMLElementEventMap[E], c?: Context) => void
          : never
        : Getter<HTMLElementTagNameMap[P][K]> | HTMLElementTagNameMap[P][K];
    }>;
  };
}
