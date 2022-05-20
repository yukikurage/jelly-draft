declare namespace JSX {
  type Element = Component;

  type IntrinsicElements = {
    [P in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[P]>;
  };
}
