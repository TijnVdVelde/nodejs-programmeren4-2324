const loglevel = process.env.LOGLEVEL || 'trace'; 
// Bepaal het logniveau, gebruik de waarde uit de environment variabele LOGLEVEL of een standaardwaarde 'trace' als fallback.

const logger = require('tracer').colorConsole({
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}} : {{message}}'], 
    // Bepaal het formaat van de logberichten. Hier worden tijdstempel, logniveau, bestandsnaam, regelnummer en bericht weergegeven.
    preprocess: function (data) {
        data.title = data.title.toUpperCase(); 
        // Zet de titel (logniveau) om naar hoofdletters voordat het logbericht wordt weergegeven.
    },
    dateformat: 'isoUtcDateTime', 
    // Bepaal het datumformaat van de tijdstempel in ISO UTC formaat.
    level: loglevel 
    // Stel het logniveau in op de waarde van de loglevel variabele.
});

module.exports = logger; 
// Exporteer de logger zodat deze gebruikt kan worden in andere delen van de applicatie.