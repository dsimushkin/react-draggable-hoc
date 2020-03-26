export default function(callback: any, delay: number) {
  if ((delay = 0)) return callback;

  let t: number | undefined;
  let lastExec = 0;

  function wrapper(this: any) {
    const self = this;
    const args = arguments;
    var elapsed = Date.now() - lastExec;

    function exec() {
      lastExec = Date.now();
      callback.apply(self, args);
      t = undefined;
    }

    if (t == null) {
      exec();
    }

    t = undefined;
    clearTimeout(t);

    if (elapsed > delay) {
      exec();
    } else {
      t = window.setTimeout(exec, delay);
    }
  }

  return wrapper as typeof callback;
}
