const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Create a new expressJs application.
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
// Reponses will return 304 if etags are enabled because we're mocking the
// response, so the data does not change. We want to be able to control the
// returned status code.
app.disable('etag'); 

const PORT = 3001;

app.listen(PORT, () => { 
  console.log(`Server started on port ${PORT}`);
})

app.get('/immediate', (request, response) => {
  respond(response, 200, {message: 'Yup.', type: 'IMMEDIATE', delay: 0}, 0);
})

app.get('/random', (request, response) => {
  const random = randomInRange(1000, 5000);
  respond(response, 200, {message: 'Hello', type: 'RANDOM', delay: random}, random);
})

app.get('/specific/:delay', (request, response) => {
  const {delay} = request.params;
  respond(response, 200, {message: 'Woohoo', type: 'SPECIFIC', delay: delay}, delay);
})

app.get('/range/:from-:to', (request, response) => {
  const {from, to} = request.params;
  const random = randomInRange(from, to);
  respond(response, 200, {message: 'Yay', type: 'RANGE', delay: random}, random);
})

app.get('/read/:statusCode/:filename', (request, response) => {
  const {statusCode, filename} = request.params;
  try {
    const stats = fs.statSync(`response/${filename}.json`);
    if (stats.isFile()) {
      const body = fs.readFileSync(`response/${filename}.json`, {encoding: 'utf-8'});
      respond(response, statusCode, body, 0);
    } else {
      throw new Error(`${filename}.json cannot be found.`);
    }
  } catch (error) {
    respond(response, 400, {'error': `Could not find ${filename}.json.`}, 0);
  }
})

function respond(response, statusCode, body = null, delay) {
  setTimeout(() => {
    response
      .status(statusCode)
      .type('application/json')
      .send(body);
  }, delay);
}

function isNumber(value) {
  return typeof parseInt(value) === 'number';
}

function toNumber(value) {
  return isNumber(value) ? parseInt(value) : null;
}
  
function randomInRange(min, max) {
  const minimum = toNumber(min);
  const maximum = toNumber(max);
  if (minimum > maximum) {
    throw Error('Range minimum cannot be greater than or equal to range maximum.');
  }
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
  


app.get('/testing', (request, response) => {
  response.status(200).type('application/json').send({});
})

// let q = [];

// function enqueue(queue, value) {
//   queue.push(value);
// }

// function dequeue(queue) {
//   queue.shift();
// }

// function peek(queue) {
//   return queue[queue.length - 1];
// }

// function isFull(queue) {
//   return false;
// }

// function isEmpty(queue) {
//   return queue.length == 0;
// }

// app.get('/queue', (request, response) => {
//   const startTime = new Date();
//   const id = setInterval(() => {
//     if (!isEmpty(q)) {
//       const stopTime = new Date();
//       respond(response, stopTime - startTime);
//       dequeue(q);
//       clearInterval(id);
//     }
//   }, 100);
// })

// app.get('/queue/push', (request, response) => {
//   enqueue(q, "data");
//   respond(response, 0);
// })








// function send(response, statusCode, body, delay = 0) {
//   setTimeout(() => {
//     response
//       .status(statusCode)
//       .header({'Access-Control-Allow-Origin': '*'})
//       .type('application/json')
//       .send(JSON.stringify(body));
//   }, delay);
// }

// function respond(response, waitMs) {
//   setTimeout(() => {
//     response
//       .status(200)
//       .header({'Access-Control-Allow-Origin': '*'})
//       .type('application/json')
//       .send(JSON.stringify({timestamp: new Date(), waitMs: waitMs}));
//   }, waitMs)
// }

// function error(response, message) {
//   response
//       .status(400)
//       .header({'Access-Control-Allow-Origin': '*'})
//       .type('application/json')
//       .send(JSON.stringify({"error": message}));
// }

