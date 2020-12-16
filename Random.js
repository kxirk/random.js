/* Copyright (c) 2020 Cody Morton https://github.com/kxirk
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/* Random.js */
/* A 32-bit seeded PRNG using MurmurHash3 (seeding) and Mulberry32 (number generation). Based of JavaScript implementations by bryc https://github.com/bryc/code/blob/master/jshash/PRNGs.md.
 * Author(s): Cody Morton
 * Verion: 0.1.0
 * Date: 2020-12-15
 */

const Random = class {
  #state = 0;  // next random

  /**
   * Random constructor.
   * seed: number - initial state of generator. Optional.
   */
  constructor (seed = Random.generateSeed()) {
    this.setState(seed);
  }

  /**
   * MurmurHash3 seed generator.
   * seedString: string - input string to MurmurHash3 algorithm. Optional.
   * return: number - seed.
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
    h ^= h >>> 16;
    return h >>> 0;
  }

  /**
   * Sets generator state to a given number.
   * state: number - state value.
   * return: undefined.
   */
  setState (state) {
    this.#state = (state ?? this.#state);
  }

  /**
   * Retrieves the generator state.
   * return: number - state value.
   */
  getState () {
    return this.#state;
  }


  /**
   * Generates a pseudorandom number between 0 (inclusive) and max (exclusive) using the Mulberry32 algorithm.
   * min: number - minimum bound. Optional.
   * max: number - maximum bound. Optional.
   * return: number - a bound pseudorandom number.
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
   * Generates a pseudorandom integer between min (inclusive) and max (inclusive/exclusive) bounds.
   * min: number - minimum bound. Optional.
   * max: number - maximum bound. Optional.
   * maxInclusive: boolean - include maximum bound in allowed range. Optional.
   * return: number - a bound pseudorandom integer.
   */
  nextInt (min = 0, max = 1, maxInclusive = false) {
    return Math.floor(this.next(min, max + (maxInclusive | 0)));
  }

  /**
   * Generates a pseudorandom boolean value (true or false).
   * probability: number - the probability that nextBoolean will be true, should be a number between 0 and 1. Optional.
   * return: boolean - a pseudorandom boolean value.
   */
  nextBoolean (probabilityTrue = 0.5) {
    return (this.next() < probabilityTrue);
  }

  /**
   * Generates a normally distributed pseudorandom number between min (inclusive) and max (inclusive) bounds using the Box–Muller transform.
   * min: number - minimum bound. Optional.
   * max: number - maximum bound. Optional.
   * return: number - a bounded, normally distributed pseudorandom number.
   */
  nextGaussian (min = 0, max = 1) {
    let u = 0; while (u === 0) u = this.next();
    let v = 0; while (v === 0) v = this.next();

    const num = (Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) / 10) + 0.5;

    if (num > 1 || num < 0) return this.nextGaussian(min, max);
    return (num * max) + min;
  }

  /**
   * Generates a normally distributed pseudorandom integer between min (inclusive) and max (inclusive) bounds.
   * min: number - minimum bound. Required.
   * max: number - maximum bound. Required.
   * return: number - a bounded, normally distributed pseudorandom integer.
   */
  nextGaussianInt (min, max) {
    return Math.floor(this.nextGaussian(min, max));
  }


  static next (min, max) { return new Random().next(min, max); }
  static nextInt (min, max, maxInclusive) { return new Random().nextInt(min, max, maxInclusive); }
  static nextBoolean () { return new Random().nextBoolean(); }
  static nextGaussian (min, max) { return new Random().nextGaussian(min, max); }
  static nextGaussianInt (min, max) { return new Random().nextGaussianInt(min, max); }
};