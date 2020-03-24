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
