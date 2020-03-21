import * as React from "react";

function useForceUpdate(): [() => void, number] {
  const [state, change] = React.useState(0);

  const update = React.useCallback(() => {
    change(state => state + 1);
  }, [change]);

  return [update, state];
}

export default useForceUpdate;
