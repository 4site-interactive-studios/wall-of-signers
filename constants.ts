// --- START: CSV Name Data ---
// This section handles fetching, parsing, and preparing names from an external CSV file.

/**
 * Shuffles an array in place using the Fisher-Yates algorithm and returns a new shuffled array.
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} A new array with the elements shuffled.
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

/**
 * Parses a simple CSV string into an array of strings.
 * It assumes a header row which it discards.
 * @param {string} csvString - The raw CSV content as a string.
 * @returns {string[]} An array of names from the CSV rows.
 */
const parseCsv = (csvString: string): string[] => {
    const lines = csvString.trim().split('\n');
    // Slice(1) removes the header row. Filter removes any blank lines.
    return lines.slice(1).filter(name => name.trim() !== '');
};

/**
 * Asynchronously fetches and processes a CSV file from a given URL.
 * The fetched names are shuffled to ensure random order on each load.
 * @param {string} [url='./signers.csv'] - The URL of the CSV file to fetch. Defaults to './signers.csv'.
 * @returns {Promise<string[]>} A promise that resolves to a prepared array of names for the wall.
 */
export const fetchCsvWallOfNames = async (url: string = './signers.csv'): Promise<string[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch CSV from ${url}:`, response.statusText);
            return [];
        }
        const csvString = await response.text();
        const preformattedNames = parseCsv(csvString);
        
        // Randomly sort the list of pre-formatted names each time it's loaded.
        const shuffledNames = shuffleArray(preformattedNames);

        // To make the wall feel substantial, repeat the shuffled list. Using a higher repeat
        // count for CSV as the source list might be smaller.
        const repeatedCsvNames = Array(20).fill(shuffledNames).flat();
        
        // Duplicate the entire list for the seamless scrolling animation.
        return [...repeatedCsvNames, ...repeatedCsvNames];
    } catch (error) {
        console.error(`Error fetching or parsing CSV from ${url}:`, error);
        return [];
    }
};
