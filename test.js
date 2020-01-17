// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Creates a client
const client = new language.LanguageServiceClient();

/**
 * TODO(developer): Uncomment the following line to run this code.
 */
// const text = 'Your text to analyze, e.g. Hello, world!';

// Prepares a document, representing the provided text
  var document = {
    content: '2-04:Client Side Calc (20 Points)\r\n' +
      'Based on the code in the slides “Input.JS” build a client side calculator then add a multiplication function(5 points),  division function(5 points),  bitwise AND function(5 points) and a bitwise OR function(5 Points).',
      type: 'PLAIN_TEXT'
  }

// Detects entities in the document
const [result] = await client.analyzeEntities({document});

const entities = result.entities;

console.log('Entities:');
entities.forEach(entity => {
  console.log(entity.name);
  console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
  if (entity.metadata && entity.metadata.wikipedia_url) {
    console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
  }
});
