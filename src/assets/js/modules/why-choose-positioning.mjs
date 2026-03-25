export const getWhyChooseModelPinState = ({ viewportHeight, modelHeight, sectionRect }) => {
  const fixedTop = Math.max((viewportHeight - modelHeight) / 2, 0);

  if (sectionRect.top >= fixedTop) {
    return {
      state: 'start',
      fixedTop
    };
  }

  if (sectionRect.bottom <= fixedTop + modelHeight) {
    return {
      state: 'end',
      fixedTop
    };
  }

  return {
    state: 'fixed',
    fixedTop
  };
};
