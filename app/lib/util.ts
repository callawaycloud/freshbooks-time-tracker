export const getTimerDisplay = (count: number) => {
  const date = new Date(0);
  date.setSeconds(count);
  return date.toISOString().substr(11, 8);
};
