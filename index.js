var _ = require('underscore');

var parser = module.exports = {};

/**
 * Parse a human name string into salutation, first name, middle name, last name, suffix
 * @param {string} name - The string we want to parse into salutation, first name, middle name, last name and suffix
 * @returns {Object} An object containing salutation, first name, middle name, last name and suffix from the name parsed
 */
parser.parseName = function (name) {
    var salutations = ['mr', 'master', 'mister', 'mrs', 'miss', 'ms', 'dr', 'prof', 'rev', 'fr', 'judge', 'honorable', 'hon'];
    var suffixes = ['i', 'ii', 'iii', 'iv', 'v', 'senior', 'junior', 'jr', 'sr', 'phd', 'apr', 'rph', 'pe', 'md', 'ma', 'dmd', 'cme'];
    var compound = ['vere', 'von', 'van', 'de', 'del', 'della', 'der', 'di', 'da', 'pietro', 'vanden', 'du', 'st.', 'st', 'la', 'lo', 'ter', 'bin', 'ibn', 'te', 'ten', 'op', 'ben'];

    var parts = name.trim().split(/\s+/);
		var attrs = {};

    if (!parts.length) {
        return attrs;
    }

    if ( parts.length === 1 ) {
        attrs.firstName = parts[0];
    }

    //handle suffix first always, remove trailing comma if there is one
    if ( parts.length > 1 && _.indexOf(suffixes, _.last(parts).toLowerCase().replace(/\./g, '')) > -1) {
        attrs.suffix = parts.pop();
        parts[parts.length-1] = _.last(parts).replace(',', '');
    }

    //look for a comma to know we have last name first format
    var firstNameFirstFormat = _.every(parts, function(part) {
        return part.indexOf(',') === -1;
    })

    if (!firstNameFirstFormat) {
    //last name first format
    //assuming salutations are never used in this format

        //tracker variable for where first name begins in parts array
        var firstNameIndex;

        //location of first comma will separate last name from rest
        //join all parts leading to first comma as last name
        var lastName = _.reduce(parts, function (lastName, current, index) {
            if (!Array.isArray(lastName)) {
                return lastName;
            }
            if (current.indexOf(',') === -1) {
                lastName.push(current)
                return lastName;
            } else {
                current = current.replace(',', '');
                lastName.push(current);
                firstNameIndex = index + 1;
                return lastName.join(' ');
            }
        }, []);

        attrs.lastName = lastName;

        var remainingParts = parts.slice(firstNameIndex);
        if (remainingParts.length > 1) {
            attrs.firstName = remainingParts.shift();
            attrs.middleName = remainingParts.join(' ');
        } else if (remainingParts.length) {
            attrs.firstName = remainingParts[0];
        }

        //create full name from attrs object
        var nameWords = [];
        if (attrs.firstName) {
            nameWords.push(attrs.firstName);
        }
        if (attrs.middleName) {
            nameWords.push(attrs.middleName)
        }
        nameWords.push(attrs.lastName)
        if (attrs.suffix) {
            nameWords.push(attrs.suffix);
        }
        attrs.fullName = nameWords.join(' ');

        
    } else {
    //first name first format


        if ( parts.length > 1 && _.indexOf(salutations, _.first(parts).toLowerCase().replace(/\./g, '')) > -1) {
            attrs.salutation = parts.shift();
            attrs.firstName = parts.shift();
        } else {
            attrs.firstName = parts.shift();
        }

        attrs.lastName  = parts.length ? parts.pop() : '';

        // test for compound last name, we reverse because middle name is last bit to be defined.
        // We already know lastname, so check next word if its part of a compound last name.
        var revParts = parts.slice(0).reverse();
				var compoundParts = [];

        _.every(revParts, function(part, i, all){
            var test = part.toLowerCase().replace(/\./g, '');

            if (_.indexOf(compound, test) > -1 ) {
                compoundParts.push(part);

                return true;
            }

            //break on first non compound word
            return false;
        });

        //join compound parts with known last name
        if ( compoundParts.length ) {
            attrs.lastName = compoundParts.reverse().join(' ') + ' ' + attrs.lastName;

            parts = _.difference(parts, compoundParts);
        }

        if ( parts.length ) {
            attrs.middleName = parts.join(' ');
        }

        //remove comma like "<lastName>, Jr."
        if ( attrs.lastName ) {
            attrs.lastName = attrs.lastName.replace(',', '');
        }

        //save a copy of original
        attrs.fullName = name;

    }
    //console.log('attrs:', JSON.stringify(attrs));
    return attrs;
};

/**
 * Gets the full name from a string containing '&' or 'and' and it will return the biggest name from that string
 * @example
 * // returns 'Peggy Sue'
 * getFullestName('John & Peggy Sue');
 * @param {string} str - The string with the '&' or 'and' we want to remove and get the fullest name
 * @returns {string} This is the string with the '&' or 'and' and with the biggest name from that initial string
 */
parser.getFullestName = function(str){
    var name = str;
		var names = [];

    //find fullname from strings like 'Jon and Sue Doyle'
    if ( name.indexOf('&') > -1 || name.toLowerCase().indexOf(' and ') > -1 ) {
        names = name.split(/\s+(?:and|&)\s+/gi);

        //pluck the name with the most parts (first, middle, last) from the array.
        //will grab 'Sue Doyle' in 'Jon & Sue Anne Doyle'
        if ( names.length ) {
            name = names.sort(function(a, b) {
                return b.split(/\s+/).length - a.split(/\s+/).length;
            })[0];
        }
    }

    return name;
};

/**
 * Parse an address into address, city, state, zip
 * @param {string} str - The string we want to parse into address, city, state, zip
 * @returns {Object} An object containing address, city, state, zip
 */
parser.parseAddress = function(str){
    //416 W. Manchester Blvd., Inglewood, CA  90301
    var parts = str.split(/,\s+/).reverse();
		var stateZip;
		var city;
		var address = {};

    stateZip = parts[0].split(/\s+/);
    parts.shift();

    city = parts.shift();

    address.address = parts.reverse().join(', ');
    address.city = city;
    address.state = stateZip[0];
    address.zip = stateZip[1];
    address.fullAddress = str;

    return address;
};
