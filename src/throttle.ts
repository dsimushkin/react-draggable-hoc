export default function(callback: any, delay: number) {
  let t: number | undefined;

  function wrapper(this: any) {
    const self = this;
    const args = arguments;
    function exec() {
      callback.apply(self, args);
    }

    if (t == null) {
      exec();
    }

    t = window.setTimeout(exec, delay);
  }

  return wrapper as typeof callback;
}
