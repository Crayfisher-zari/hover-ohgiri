export const isFindShortcut = (event: KeyboardEvent): boolean => {
  const key = event.key.toLowerCase();
  return (
    key === "f" &&
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey
  );
};

export const onFindShortcut = (handler: (event: KeyboardEvent) => void) => {
  const listener = (event: KeyboardEvent) => {
    if (!isFindShortcut(event)) return;
    event.preventDefault();
    handler(event);
  };

  window.addEventListener("keydown", listener);
  return () => window.removeEventListener("keydown", listener);
};
