# Sator square generator

## What's this

A quick and dirty experiment that generates [Sator](https://en.wikipedia.org/wiki/Sator_Square) 
magic squares of any size.

## Why

Because the existing scripts I've found generate squares that are readable only horizontally.
The original is readable both vertically and horizontally.

Also it was a fun problem to solve and I wanted to get an idea of how frequent Sator squares are in a language (Spoiler: they are really hard to find, even with a > 1000000 words English dictionary!).

## How

```sh
# Generates a sator square of size 5 from dictionary.txt
node sator.js -s 5 -d dictionary.txt
```

For example using the `american-english-large` dictionary found [here](https://www.levidromelist.com/levidrome-list/dictionary) you can get something like:

```
t i m i d
i r a n i
m a d a m
i n a r i
d i m i t
```