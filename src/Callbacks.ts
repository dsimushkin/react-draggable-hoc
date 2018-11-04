export class Callbacks<T, D extends string> {
  private payload: T;
  private events: {
    [key in string]: Array<(payload: T) => any>
  } = {}

  constructor(payload: T) {
    this.payload = payload;
  }

  public on = (event: D, callback: (payload: T) => any) => {
    if (this.events[event] === undefined) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  public off = (event: D, callback: (payload: T) => any) => {
    if (this.events[event] != null) {
      const index = this.events[event].indexOf(callback);
      if (index >= 0) {
        this.events[event].splice(index, 1);
      }
    }
  }

  public notify = (event: D) => {
    if (this.events[event]) {
      this.events[event].forEach((callback: (payload: T) => any) => {
        callback(this.payload);
      })
    }
  }
}
