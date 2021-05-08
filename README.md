Random.js
==========

A 32-bit seeded PRNG using MurmurHash3 (seeding) and Mulberry32 (number generation). 
Based of JavaScript implementations by [bryc](https://github.com/bryc/code/blob/master/jshash/PRNGs.md).


Features
--------

Random.js provides the following features:
* Secure string generation
* Seed generation
* `next`, `nextBoolean`, `nextGaussian`, `nextGaussianInt`, `nextInt`, and `nextSign` implementations


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
Or use Random's seed generator with a string:
``` js
random.seed = Random.generateSeed("seed");
```

### String Generation ###
Alternatively, secure random strings can be generated:
``` js
let randomString = Random.generateSecureString();
```
And be used to seed the Random instance:
``` js
random.seed = Random.generateSeed(randomString);
```

### Instance Methods ###

Method | Usage
------ | -----
next (min = 0.0, max = 1.0) | Generates a pseudorandom number [min, max)
nextBoolean (probabilityTrue = 0.5) | Generates a pseudorandom boolean value
nextGaussian (min = 0.0, max = 1.0, mean = 0.0, stdev = 1.0, skew = 0.0) | Generates a normally distributed, pseudorandom number [min, max]
nextGaussianInt (min = 0, max = 1, mean = 0.0, stdev = 1.0, skew = 0.0) | Generates a normally distributed, pseudorandom integer [min, max]
nextInt (min = 0, max = 1, maxInclusive = false) | Generates a pseudorandom integer [min, max)]
nextSign (probabilityPositive = 0.5) | Generates a pseudorandom integer -1 or +1


Author
------

[Cody Morton](https://github.com/kxirk)


License
-------

[MIT](LICENSE)