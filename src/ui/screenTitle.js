// One big quiet word that says where you are. Deliberately dumb: the casing is CSS's job
// (text-transform), so the accessible name stays as readable as the text passed in.
export const screenTitle = (text) => {
  const title = document.createElement('h1');
  title.className = 'screen-title';
  title.textContent = text;
  return title;
};
