/* Copyright (c) 2020 Cody Morton https://github.com/kxirk
 *
 * This software is released under the terms of the MIT liscence (https://opensource.org/licenses/MIT).
 */


/**
 * A 32-bit seeded PRNG using MurmurHash3 (seeding) and Mulberry32 (number generation). Based of JavaScript implementations by bryc (https://github.com/bryc/code/blob/master/jshash/PRNGs.md).
 * Verion: 0.1.2
 * Date: 2020-12-19
 */

const Random = class {
  /** @member {number} */
  #state;

  /**
   * Initializes Random.
   * @argument {number} [seed] - initial state of Random generator.
   */
  constructor (seed = Random.generateSeed()) {
    this.setState(seed);
  }

  /**
   * MurmurHash3 seed generator.
   * @argument {string} [seedString] - input string to MurmurHash3 algorithm.
   * @returns {number} output seed.
   */
  static generateSeed (seedString = Date.now().toString()) {
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


  /**
   * XMessenger state accessor.
   * @returns {number} Random state.
   */
  getState () {
    return this.#state;
  }
  /**
   * Random state mutator.
   * @argument {number} state - Random state.
   * @returns {undefined}
   */
  setState (state) {
    this.#state = state ?? this.#state;
  }


  /**
   * Generates a pseudorandom number [min, max) using the Mulberry32 algorithm.
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @returns {number} a bounded pseudorandom number.
   */
  next (min = 0, max = 1) {
    // Mulberry32
    this.#state |= 0; this.#state += 0x6D2B79F5 | 0;

    let t = Math.imul(this.#state ^ (this.#state >>> 15), 1 | this.#state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;

    const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    //

    return (random * (max - min)) + min;
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

  /**
   * Generates a pseudorandom boolean value.
   * @argument {number} [probabilityTrue] - probability of true [0, 1].
   * @returns {boolean} a pseudorandom boolean value.
   */
  nextBoolean (probabilityTrue = 0.5) {
    return (this.next() < probabilityTrue);
  }

  /**
   * Generates a normally distributed, pseudorandom number [min, max] using the Box–Muller transform.
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @returns {number} a bounded, normally distributed pseudorandom number.
   */
  nextGaussian (min = 0, max = 1) {
    let u = 0; while (u === 0) u = this.next();
    let v = 0; while (v === 0) v = this.next();

    const num = (Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) / 10) + 0.5;

    if (num > 1 || num < 0) return this.nextGaussian(min, max);
    return (num * max) + min;
  }

  /**
   * Generates a normally distributed, pseudorandom integer [min, max].
   * @argument {number} [min] - minimum bound.
   * @argument {number} [max] - maximum bound.
   * @returns {number} a bounded, normally distributed pseudorandom integer.
   */
  nextGaussianInt (min = 0, max = 1) {
    return Math.floor(this.nextGaussian(min, max));
  }


  static next (min, max) { return new Random().next(min, max); }
  static nextInt (min, max, maxInclusive) { return new Random().nextInt(min, max, maxInclusive); }
  static nextBoolean (probabilityTrue) { return new Random().nextBoolean(probabilityTrue); }
  static nextGaussian (min, max) { return new Random().nextGaussian(min, max); }
  static nextGaussianInt (min, max) { return new Random().nextGaussianInt(min, max); }
};