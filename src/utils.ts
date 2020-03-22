const id = "log";
export const log = (...messages: any) => {
  let element = document.getElementById(id);
  if (element == null) {
    element = document.createElement("div");
    element.id = id;
    document.body.appendChild(element);
  }
  element.innerHTML = "";
  messages.forEach((e: any) => {
    element!.innerHTML += JSON.stringify(e);
  });
  console.log(...messages);
};

export function remove<T>(arr: Array<T>, e: T) {
  const index = arr.indexOf(e);

  if (index >= 0) {
    return arr.splice(index, 1);
  }

  return undefined;
}
