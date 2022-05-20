import jelly, { createEffect, createState, createUnmountEffect } from "jelly";

const [state, setState, modifyState] = createState(0);

const Component = ({ children }: { children?: Component[] }) => {
  setState(0);

  createEffect((c) => {
    console.log(state(c));
  });

  const id = setInterval(() => {
    modifyState((x) => x + 1);
  }, 100);

  createUnmountEffect(() => {
    clearInterval(id);
  });
  return (
    <div>
      {(c: Context) => state(c).toString()}
      {children}
    </div>
  );
};

export default Component;
