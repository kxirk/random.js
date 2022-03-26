/* Copyright (c) 2020-2022 Cody Morton https://github.com/kxirk
 * This software is released under the terms of the MIT license (https://opensource.org/licenses/MIT).
 */

const crypto = require("crypto");


/**
 * A 32-bit seeded PRNG. Based on JavaScript implementations by bryc (https://github.com/bryc/code/blob/master/jshash/PRNGs.md).
 * Version: 1.2.0
 * Date: 2022-03-26
 */
const Random = class {
  /** @type {number} */
  #seed;
  /** @type {number} */
  #state;

  /**
   * Initializes a Random instance.
   * @argument {number} [seed] - initial state of generator.
   */
  constructor (seed = Random.generateSeed()) {
    this.#seed = seed;
    this.state = seed;
  }

  /**
   * Secure random string generator.
   * @argument {number} [charCount] - number of characters to generate.
   * @returns {string} secure random string.
   */
  static generateSecureString (charCount = 32) {
    const arr = crypto.randomBytes(charCount);

    return String.fromCharCode(...arr);
  }

  /**
   * MurmurHash3 seed generator.
   * @argument {string} [seedString] - input string to MurmurHash3 algorithm.
   * @returns {number} seed.
   */
  static generateSeed (seedString = Random.generateSecureString()) {
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
    return (h ^= h >>> 16) >>> 0;
  }


  /** @type {number} */
  get seed () {
    return this.#seed;
  }

  /** @type {number} */
  get state () {
    return this.#state;
  }
  set state (state) {
    this.#state = (state ?? this.#state);
  }


  /**
   * Generates a pseudorandom number [min, max).
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @returns {number} a bounded pseudorandom number.
   */
  next (min = 0.0, max = 1.0) {
    // Mulberry32
    this.#state |= 0; this.#state += 0x6D2B79F5 | 0;

    let t = Math.imul(this.#state ^ (this.#state >>> 15), 1 | this.#state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;

    const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return (random * (max - min)) + min;
  }
  static next (min, max) {
    return new Random().next(min, max);
  }

  /**
   * Generates a normally distributed, pseudorandom number [min, max].
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @argument {number} [mean] - distribution mean.
   * @argument {number} [stdDev] - distribution standard deviation.
   * @argument {number} [skew] - distribution skewness.
   * @returns {number} a bounded, normally distributed, pseudorandom number.
   */
  nextGaussian (min = 0.0, max = 1.0, mean = 0.0, stdDev = 1.0, skew = 0.0) {
    const randomNormals = () => {
      // Box–Muller transform
      let u1 = 0; while (u1 === 0) u1 = this.next();
      let u2 = 0; while (u2 === 0) u2 = this.next();

      const r = Math.sqrt(-2.0 * Math.log(u1));
      const theta = 2.0 * Math.PI * u2;

      return [r * Math.cos(theta), r * Math.sin(theta)];
    };

    // multivariate skew-normal distribution
    const [u, v] = randomNormals();

    let random;
    if (skew === 0) {
      random = mean + (stdDev * u);
    }
    else {
      const correlation = skew / Math.sqrt(1 + (skew ** 2));
      const u1 = (correlation * u) + (v * Math.sqrt(1 - (correlation ** 2)));
      const z = (u >= 0 ? u1 : -u1);

      random = mean + (stdDev * z);
    }
    //

    const randomMin = (-3.0 * stdDev);
    const randomMax = (+3.0 * stdDev);

    const ret = ((random - randomMin) * (max - min) / (randomMax - randomMin)) + min;
    if (ret < min || ret > max) return this.nextGaussian(min, max, mean, stdDev, skew);
    return ret;
  }
  static nextGaussian (min, max, mean, stdDev, skew) {
    return new Random().nextGaussian(min, max, mean, stdDev, skew);
  }

  /**
   * Generates a pseudorandom integer [min, max)].
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @argument {boolean} [maxInclusive] - include maximum bound.
   * @returns {number} a bounded pseudorandom integer.
   */
  nextInt (min = 0, max = 1, maxInclusive = false) {
    return Math.floor(this.next(min, max + (maxInclusive | 0)));
  }
  static nextInt (min, max, maxInclusive) {
    return new Random().nextInt(min, max, maxInclusive);
  }

  /**
   * Generates a normally distributed, pseudorandom integer [min, max].
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @argument {number} [mean] - distribution mean.
   * @argument {number} [stdDev] - distribution standard deviation.
   * @argument {number} [skew] - distribution skewness.
   * @returns {number} a bounded, normally distributed, pseudorandom integer.
   */
  nextGaussianInt (min = 0, max = 1, mean = 0.0, stdDev = 1.0, skew = 0.0) {
    return Math.floor(this.nextGaussian(min, max, mean, stdDev, skew));
  }
  static nextGaussianInt (min, max, mean, stdDev, skew) {
    return new Random().nextGaussianInt(min, max, mean, stdDev, skew);
  }

  /**
   * Generates a pseudorandom boolean value.
   * @argument {number} [probabilityTrue] - probability of true [0, 1].
   * @returns {boolean} a pseudorandom boolean value.
   */
  nextBoolean (probabilityTrue = 0.5) {
    return (this.next() < probabilityTrue);
  }
  static nextBoolean (probabilityTrue) {
    return new Random().nextBoolean(probabilityTrue);
  }

  /**
   * Generates a pseudorandom integer -1 or +1.
   * @argument {number} [probabilityPositive] - probability of positive 1 [0, 1].
   * @returns {number} a pseudorandom integer -1 or +1.
   */
  nextSign (probabilityPositive = 0.5) {
    return (this.nextBoolean(probabilityPositive) ? +1 : -1);
  }
  static nextSign (probabilityPositive) {
    return new Random().nextSign(probabilityPositive);
  }
};


// random.js
module.exports = Random;
