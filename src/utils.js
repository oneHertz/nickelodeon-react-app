export const printTime = (t) => {
    const prependZero = (x) => {
      return ('0' + x).slice(-2);
    };
    t = Math.round(t);
    const h = Math.floor(t / 3600),
        m = Math.floor((t % 3600) / 60),
        s = t % 60;
    if (h === 0) {
      return [m, prependZero(s)].join(':');
    }
    return [h, prependZero(m), prependZero(s)].join(':');
};
