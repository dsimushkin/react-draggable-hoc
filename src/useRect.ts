import * as React from "react";

function useRect(ref: React.RefObject<any>, deps: any[] = []) {
  const [rect, changeRect] = React.useState<any>({});
  React.useEffect(() => {
    const node = ref && ref.current;
    changeRect(node.getBoundingClientRect());
  }, deps);

  const [size, position] = React.useMemo(() => {
    const { width, height, left, top } = rect;
    return [
      { width, height },
      { left, top }
    ];
  }, [rect]);

  return [rect, size, position];
}

export default useRect;
