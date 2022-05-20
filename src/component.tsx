import jelly, { Context, createEffect, createState } from "jelly";

const [state, setState, modifyState] = createState(0);

const Component = () => {
  setState(0);

  createEffect((c) => {
    console.log(state(c));
  });

  return <div>{(c: Context) => state(c).toString()}</div>;
};

setInterval(() => {
  modifyState((x) => x + 1);
}, 500);

export default Component;
