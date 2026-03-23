export const bindDialogTriggers = (triggers, onOpen) => {
  if (!Array.isArray(triggers) || typeof onOpen !== 'function') {
    return;
  }

  triggers.forEach((trigger) => {
    trigger?.addEventListener?.('click', onOpen);
  });
};
