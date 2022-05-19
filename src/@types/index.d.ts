declare namespace JSX {
  type Element = HTMLElement;

  type IntrinsicElements = {
    [P in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[P]>;
  };
}
