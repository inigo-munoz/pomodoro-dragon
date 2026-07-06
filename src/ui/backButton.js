export const backButton = (onBack) => {
  const back = document.createElement('button');
  back.className = 'back-btn';
  back.textContent = '← Back';
  back.addEventListener('click', onBack);
  return back;
};
