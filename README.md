random.js
==========

A 32-bit seeded PRNG using MurmurHash3 (seeding) and Mulberry32 (number generation). \
Based on JavaScript implementations by [bryc](<https://github.com/bryc/code/blob/master/jshash/PRNGs.md>). \
Skew-Normal Transform by [Tom Liao](<https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/>).

Features
--------

random.js provides the following features:

* String generation
* Seed generation
* `next`, `nextInt`, `nextNormal`, `nextNormalInt`, `nextBoolean`, and `nextSign` methods
* Configuring `floor`, `ceil`, `trunc`, or `round` on integer methods

Usage
-----

### Initialization ###

Start by creating a Random instance:

``` js
let random = new Random();
```

### Seeding ###

Set the instance seed directly with a number:

``` js
random.seed = 12345;
```

Or use Random's seed generator by providing a string:

``` js
random.seed = Random.generateSeed("seed");
```

### String Generation ###

Alternatively, random strings can be generated:

``` js
let randomString = Random.generateString();
```

And be used to seed the Random instance:

``` js
random.seed = Random.generateSeed(randomString);
```

### Instance Methods ###

Method | Usage
----- | -----
next (min = 0.0, max = 1.0) | Generates a pseudorandom float [min, max)
nextInt (min, max, maxInclusive = false) | Generates a pseudorandom integer [min, max)]
nextNormal (mean = 0.0, stdev = 1.0, skewness = 0.0) | Generates a normally distributed, unbounded, pseudorandom float
nextNormalInt (mean, stdDev, skewness) | Generates a normally distributed, unbounded, pseudorandom integer
nextBoolean (probabilityTrue = 0.5) | Generates a pseudorandom boolean
nextSign (probabilityPositive = 0.5) | Generates a pseudorandom integer -1 or +1

Author
------

[Cody Morton](https://github.com/kxirk)

License
-------

[MIT](LICENSE)
