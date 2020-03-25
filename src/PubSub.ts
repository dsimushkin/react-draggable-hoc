import { remove } from "./utils";

class PubSub<T extends string, K extends Function> {
  subs: {
    [key in T]?: K[];
  } = {};

  on = (e: T, fn: K) => {
    if (e == null) throw new Error("Event name should be provided");
    this.off(e, fn);
    if (this.subs[e] == null) this.subs[e] = [];
    this.subs[e]!.push(fn);
    return () => this.off(e, fn);
  };

  off = (e: T, fn: K) => {
    if (e == null) throw new Error("Event name should be provided");
    if (this.subs[e] != null) {
      remove(this.subs[e]!, fn);
    }
  };

  notify = async (e: T, ...args: any) => {
    if (e == null) throw new Error("Event name should be provided");
    if (this.subs[e] != null) {
      const subs = this.subs[e]!.slice();
      for (let sub of subs) {
        await sub(...args);
      }
    }
  };

  notifySync = (e: T, ...args: any) => {
    if (e == null) throw new Error("Event name should be provided");
    if (this.subs[e] != null) {
      const subs = this.subs[e]!.slice();
      for (let sub of subs) {
        sub(...args);
      }
    }
  };
}

export default PubSub;
