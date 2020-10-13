compare = (property) => {
    return (a, b) => {
        // Use toUpperCase() to ignore character casing
        const pA = a[property].toUpperCase();
        const pB = b[property].toUpperCase();

        let comparison = 0;
        if (pA > pB) {
            comparison = 1;
        } else if (pA < pB) {
            comparison = -1;
        }
        return comparison;
    }

}

exports.sort = (data, property) => {
    data.sort(compare(property));
}

exports.sortLocale = (data, property) => {
    data.sort((a, b) => a[property].localeCompare(b[property]));
}