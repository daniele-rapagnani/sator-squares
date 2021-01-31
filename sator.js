const argv = require("yargs")
    .option("dictionary", {
        alias: "d",
        type: "string",
        default: "dictionary.txt"
    })
    .option("size", {
        alias: "s",
        type: "integer",
        default: 5
    })
    .option("verbose", {
        alias: "v"
    })
    .help()
    .argv
;

const fs = require("fs");
const warningDictSize = 50 * 1024 * 1024;

const log = function () {
    if (argv.verbose) {
        console.log.apply(this, arguments);
    }
};

const reverseStr = (str) => {
    let rev = "";
    for (let i = str.length - 1; i >= 0; i--) {
        rev += str[i];
    }

    return rev;
};

const loadDict = (dictFile, size) => {
    if (!fs.existsSync(dictFile)) {
        return null;
    }

    var stats = fs.statSync(dictFile);
    
    if (stats.size > warningDictSize) {
        console.warn(`WARNING: The dictionary file is ${stats.size} bytes, it may be too large to fit in memory.`);
    }
    
    let dictStr = fs.readFileSync(dictFile, "utf8");

    if (dictStr[dictStr.length - 1] != "\n") {
        dictStr += "\n";
    }
    
    let line = "";

    const maybeDict = {};
    
    var pali = [];
    const pair = [];
    let count = 0;

    for (let i = 0; i < dictStr.length; i++) {
        if (dictStr[i] == "\n") {
            if (size == line.length && /^[a-z]+$/i.test(line)) {
                const rev = reverseStr(line);

                if (rev == line) {
                    pali.push(line);
                } else if (maybeDict[rev]) {
                    pair.push([line, rev]);
                    delete maybeDict[rev];
                } else {
                    maybeDict[line] = true;
                }
            }

            count++;
            line = "";
        } else {
            line += dictStr[i].toLowerCase();
        }
    }

    return { pali, pair, count };
};

const makeSatorWithFirst = (firstPair, words) => {
    const size = firstPair[0].length;
    const square = new Array(size);
    const semordnilaps = [].concat(words.pair);
    const palindromes = [].concat(words.pali);

    const getFirstLast = (list, first, last) => {
        fllist = [];

        const matches = (s) =>
            s.substr(0, first.length) == first 
            && s.substr(s.length - last.length) == last
        ;

        list.forEach((i) => {
            if (matches(i[0])) {
                fllist.push(i);
            } else if (matches(i[1])) {
                fllist.push([i[1], i[0]]);
            }
        });

        return fllist;
    }

    const popRandItem = (list) => {
        if (list.length == 0) {
            return null;
        }

        const idx = Math.round(Math.random() * (list.length - 1));
        const item = list[idx];

        list.splice(idx, 1);
        
        return item;
    }

    square[0] = firstPair[0];
    square[size - 1] = firstPair[1];

    const lastIdx = Math.floor((size - 1) / 2);
    
    for (let i = 1; i < lastIdx; i++) {
        let prefix = "";

        for (let j = 0; j < i; j++) {
            prefix += square[j][i];
        }

        let postfix = "";

        for (let j = i - 1; j >= 0; j--) {
            postfix += square[j][size - i - 1];
        }
        
        const fl = getFirstLast(semordnilaps, prefix, postfix);
        const item = popRandItem(fl);
        
        if (!item) {
            return false;
        }

        square[i] = item[0];
        square[size - i - 1] = item[1];
    }

    let prefix = "";

    for (let j = 0; j < lastIdx; j++) {
        prefix += square[j][lastIdx];
    }

    const paliCands = palindromes.filter((i) => i.substr(0, prefix.length) == prefix);
    const center = popRandItem(paliCands);

    if (!center) {
        return false;
    }

    square[Math.floor(size / 2)] = center;

    return square;
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

const makeSator = (words) => {
    const firstCandidates = [].concat(words.pair);

    shuffleArray(firstCandidates);

    while (firstCandidates.length > 0) {
        let item = firstCandidates.pop();
        item = Math.random() >= 0.5 ? item : [item[1], item[0]];

        let square = makeSatorWithFirst(item, words);
        
        if (square) {
            return square;
        }

        square = makeSatorWithFirst([item[1], item[0]], words);

        if (square) {
            return square;
        }
    }

    return null;
};

if (argv.size % 2 == 0) {
    console.error("ERROR: Size should be odd");
    process.exit(1);
}

log("Loading dictionary...");
const words = loadDict(argv.dictionary, argv.size);
log("Loaded.");

if (!words) {
    console.error(`ERROR: Can't load dictionary ${argv.dictionary}`);
    process.exit(1);
}

log(`Dictionary has ${words.count} words`);
log(`There are ${words.pair.length} semordnilap words and ${words.pali.length} palindromes of size ${argv.size}`);

if (words.pair.length < Math.floor(argv.size / 2)) {
    console.error("Not enough semordnilaps");
    process.exit(1);
}

if (words.pali.length == 0) {
    console.error("Not enough palindromes");
    process.exit(1);
}

const sq = makeSator(words);

if (!sq) {
    console.error("Couldn't find any sator square!");
    process.exit(1);
}

console.log("\n");
sq.forEach((w) => {
    for (let i = 0; i < w.length; i++) {
        process.stdout.write(`${w[i]} `);
    }
    console.log("");
});
console.log("\n");