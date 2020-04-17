import { remove } from "./utils";

class PubSub<T extends string, K extends (...args: any[]) => any> {
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

  notify = async (e: T, ...args: Parameters<K>) => {
    if (e == null) throw new Error("Event name should be provided");
    if (this.subs[e] != null) {
      const subs = this.subs[e]!.slice();
      for (let sub of subs) {
        await sub(...args);
      }
    }
  };

  notifySync = (e: T, ...args: Parameters<K>) => {
    if (e == null) throw new Error("Event name should be provided");
    if (this.subs[e] != null) {
      const subs = this.subs[e]!;
      for (let i = 0; i < subs.length; i++) {
        subs[i](...args);
      }
    }
  };
}

export default PubSub;
