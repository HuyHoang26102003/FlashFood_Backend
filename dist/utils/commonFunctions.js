"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomEmail = exports.calculateDistance = void 0;
const unique_names_generator_1 = require("unique-names-generator");
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
const generateRandomEmail = () => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com'];
    const randomString = generatePrefixEmail();
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return {
        email: `${randomString.prefixEmail}@${randomDomain}`,
        fullName: {
            prefixEmail: randomString.prefixEmail,
            first_name: randomString.first_name,
            last_name: randomString.last_name
        }
    };
};
exports.generateRandomEmail = generateRandomEmail;
function generatePrefixEmail() {
    const adjective = (0, unique_names_generator_1.uniqueNamesGenerator)({
        dictionaries: [unique_names_generator_1.adjectives],
        length: 1
    });
    const animal = (0, unique_names_generator_1.uniqueNamesGenerator)({
        dictionaries: [unique_names_generator_1.animals],
        length: 1
    });
    const randomString = `${adjective}-${animal}`;
    return {
        prefixEmail: `${randomString}${Math.floor(Math.random() * 100)}`,
        first_name: adjective,
        last_name: animal
    };
}
//# sourceMappingURL=commonFunctions.js.map