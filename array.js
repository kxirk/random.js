/* eslint-disable no-extend-native */ // library


/**
 * @callback random
 * @returns {number} [0, 1)
 */

Object.defineProperty(Array.prototype, "random", {
  /**
   * @template T
   * @param {random} [random]
   * @returns {T}
   */
  value (random = Math.random) {
    const index = Math.floor(random() * this.length);
    return this[index];
  },
  enumerable: false
});

Object.defineProperty(Array.prototype, "shuffle", {
  /**
   * @param {random} [random]
   * @modifies {this}
   * @returns {this}
   */
  value (random = Math.random) {
    for (let i = (this.length - 1); i > 0; i--) {
      const j = Math.floor(random() * (i + 1));

      [this[i], this[j]] = [this[j], this[i]];
    }

    return this;
  },
  enumerable: false
});


export default Array;
