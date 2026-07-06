export const createScreenManager = (root, screens) => ({
  show(name) {
    root.replaceChildren();
    const el = screens[name];
    if (el) root.appendChild(el);
  },
});
