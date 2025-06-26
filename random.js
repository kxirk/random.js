/* eslint-disable no-bitwise */ // library


/**
 * A 32-bit seeded PRNG. Based on JavaScript implementations by bryc (https://github.com/bryc/code/blob/master/jshash/PRNGs.md)
 */
const Random = class {
  /** @type {Random} */ static shared = new this(Date.now());

  /**
   * @param {number} [charCount]
   * @returns {string}
   */
  static generateString (charCount = 32) {
    const charCodes = [];
    for (let i = 0; i < charCount; i++) {
      const charCode = Math.trunc(Math.random() * (2 ** 16));
      charCodes.push(charCode);
    }

    return String.fromCharCode(...charCodes);
  }

  /**
   * @param {string} [seedString]
   * @returns {number}
   */
  static generateSeed (seedString = Random.generateString()) {
    // MurmurHash3
    let h = 2166136261 >>> 0;
    let k = 0;
    for (let i = 0; i < seedString.length; i++) {
      k = Math.imul(seedString.charCodeAt(i), 3432918353); k = (k << 15) | (k >>> 17);
      h ^= Math.imul(k, 461845907); h = (h << 13) | (h >>> 19);
      h = Math.imul(h, 5) + 3864292196 | 0;
    }

    h ^= seedString.length;
    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h = (h ^= h >>> 16) >>> 0;

    return h;
  }


  /** @type {number} */ #seed;
  /** @type {number} */ #state;

  /**
   * @param {number} [seed]
   */
  constructor (seed = Random.generateSeed()) {
    this.#seed = seed;
    this.#state = seed;
  }


  /** @type {number} */
  get seed () { return this.#seed; }

  /** @type {number} */
  get state () { return this.#state; }
  set state (state) { this.#state = state; }


  /**
   * @param {number} [min]
   * @param {number} [max]
   * @returns {number} [min, max)
   */
  next (min = 0.0, max = 1.0) {
    // SplitMix32
    this.#state |= 0; this.#state += (0x9e3779b9 | 0);

    let t = Math.imul((this.#state ^ (this.#state >>> 16)), 0x21f0aaad);
    t = Math.imul((t ^ (t >>> 15)), 0x735a2d97);

    const random = (((t ^ (t >>> 15)) >>> 0) / 4294967296);

    return ((random * (max - min)) + min);
  }

  /**
   * @param {number} [min]
   * @param {number} [max]
   * @param {number} [mode]
   * @returns {number} [min, max)
   */
  nextTriangular (min = 0.0, max = 1.0, mode = (min + max) / 2) {
    const variate = this.next();

    const inflection = ((mode - min) / (max - min));
    if (variate < inflection) {
      return (min + Math.sqrt(variate * (max - min) * (mode - min)));
    }
    return (max - Math.sqrt((1 - variate) * (max - min) * (max - mode)));
  }

  /**
   * @param {number} [mean]
   * @param {number} [sd]
   * @returns {number}
   */
  nextNormal (mean = 0.0, sd = 1.0) {
    // Box-Muller transform
    let u = 0; while (u === 0) u = this.next();
    let v = 0; while (v === 0) v = this.next();

    const r = Math.sqrt(-2 * Math.log(u));
    const theta = (2 * Math.PI * v);

    const z = (r * Math.cos(theta)); // (r * Math.sin(theta))

    return ((z * sd) + mean);
  }

  /**
   * @param {number} [probabilityTrue] [0, 1]
   * @returns {boolean}
   */
  nextBoolean (probabilityTrue = 0.5) {
    return (this.next() < probabilityTrue);
  }

  /**
   * @param {number} [probabilityPositive] [0, 1]
   * @returns {number} -1 or +1
   */
  nextSign (probabilityPositive = 0.5) {
    return (this.nextBoolean(probabilityPositive) ? +1 : -1);
  }
};
export default Random;
