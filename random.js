/**
 * A 32-bit seeded PRNG. Based on JavaScript implementations by bryc (https://github.com/bryc/code/blob/master/jshash/PRNGs.md).
 * Skew-Normal Transform by Tom Liao (https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/).
 * Version: 2.0.0
 * Date: 2023-03-07
 */
const Random = class {
  /** @type {number} */
  #seed;
  /** @type {number} */
  #state;

  /** @type {string} */
  #round; // floor, ceil, trunc, round

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

  /**
   * @param {number} [seed]
   * @param {string} [round]
   */
  constructor (seed = Random.generateSeed(), round = "trunc") {
    this.#seed = seed;
    this.state = seed;

    this.round = round;
  }


  /** @type {number} */
  get seed () { return this.#seed; }

  /** @type {number} */
  get state () { return this.#state; }
  set state (state) {
    this.#state = (state ?? this.#state);
  }


  /** @type {string} */
  get round () { return this.#round; }
  set round (round) { this.#round = round; }


  /**
   * @param {number} [min]
   * @param {number} [max]
   * @returns {number} [min, max)
   */
  next (min = 0.0, max = 1.0) {
    // Mulberry32
    this.#state |= 0; this.#state += 0x6D2B79F5 | 0;

    let t = Math.imul(this.#state ^ (this.#state >>> 15), 1 | this.#state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);

    const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return (random * (max - min)) + min;
  }
  /**
   * @param {number} min
   * @param {number} max
   * @param {boolean} [maxIncluded]
   * @returns {number} integer [min, max)]
   */
  nextInt (min, max, maxIncluded = false) {
    return Math[this.round](this.next(min, max + (maxIncluded | 0)));
  }

  /**
   * @param {number} [mean]
   * @param {number} [stdDev]
   * @param {number} [skewness]
   * @returns {number}
   */
  nextNormal (mean = 0.0, stdDev = 1.0, skewness = 0.0) {
    // Box-Muller transform
    let u = 0; while (u === 0) u = this.next();
    let v = 0; while (v === 0) v = this.next();

    const r = Math.sqrt(-2 * Math.log(u));
    const theta = (2 * Math.PI * v);

    const x = (r * Math.cos(theta));
    const y = (r * Math.sin(theta));

    // skew-normal transform
    let num;
    if (skewness === 0) {
      num = ((x * stdDev) + mean);
    }
    else {
      const correlation = (skewness / Math.sqrt(1 + (skewness ** 2)));
      const k = ((x * correlation) + (y * Math.sqrt(1 - (correlation ** 2))));
      const z = ((x >= 0) ? k : -k);

      num = ((z * stdDev) + mean);
    }

    return num;
  }
  /**
   * @param {number} mean
   * @param {number} stdDev
   * @param {number} skewness
   * @returns {number}
   */
  nextNormalInt (mean, stdDev, skewness) {
    return Math[this.round](this.nextNormal(mean, stdDev, skewness));
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
