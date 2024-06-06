export default (action, payload = null) => {
  return JSON.stringify({ action, payload });
};
