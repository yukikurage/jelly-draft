import jelly, { createEffect, createState } from "jelly";

const [state, setState, modifyState] = createState(0);

createEffect((c) => {
  console.log(state(c));
});

const Component = () => {
  setState(0);

  return <div>{state}</div>;
};

setInterval(() => {
  modifyState((x) => x + 1);
}, 1000);

export default Component;
