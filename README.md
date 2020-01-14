humanparser JavaScript Bug Squash
=========

`humanparser` is a third-party library we use at Remind to parse a human name string into salutation, first name, middle name, last name, and suffix.

## The Bug
When parseName is called for a salutation and last name only, it is returning the last name as the first name:

```
const human = require("humanparser")
const attrs = human.parseName("Ms. Smith")
console.log(attrs);
```

actual:

```
{ 
    salutation: 'Ms.',
    firstName: 'Smith',
    lastName: '',
    fullName: 'Ms. Smith'
}
```
expected:
```
{ 
    salutation: 'Ms.',
    firstName: '',
    lastName: 'Smith',
    fullName: 'Ms. Smith'
}
```
## Your Goal
Your goal is to find the root cause of this bug, then fix it if you have time!
