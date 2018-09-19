const express = require('express');
const app = express();

app.get('/immediate', (request, response) => {
  respond(response, 0);
})

app.get('/random', (request, response) => {
  respond(response, randomInRange(0, 10000)); // some arbitrary range.
})

app.get('/specific/:waitMs', (request, response) => {
  const params = request.params;
  if (params.waitMs && isNumber(params.waitMs)) {
    respond(response, toNumber(params.waitMs));
  } else {
    error(response, 'Specific wait value must be an integer.');
  }
})

app.get('/range/:from-:to', (request, response) => {
  const params = request.params;
  if (isNumber(params.from) && isNumber(params.to)) {
    const waitMs = randomInRange(params.from, params.to);
    respond(response, waitMs);
  } else {
    error(response, 'Values for range must be integers.');
  }
})

let q = [];

function enqueue(queue, value) {
  queue.push(value);
}

function dequeue(queue) {
  queue.shift();
}

function peek(queue) {
  return queue[queue.length - 1];
}

function isFull(queue) {
  return false;
}

function isEmpty(queue) {
  return queue.length == 0;
}

app.get('/queue', (request, response) => {
  const startTime = new Date();
  const id = setInterval(() => {
    if (!isEmpty(q)) {
      const stopTime = new Date();
      respond(response, stopTime - startTime);
      dequeue(q);
      clearInterval(id);
    }
  }, 100);
})

app.get('/queue/push', (request, response) => {
  enqueue(q, "data");
  respond(response, 0);
})


app.listen(1234, () => {
  console.log('Express app listening on port 1234!');
})




function isNumber(value) {
  return typeof parseInt(value) === 'number';
}

function toNumber(value) {
  return isNumber(value) ? parseInt(value) : null;
}

function respond(response, waitMs) {
  setTimeout(() => {
    response
      .status(200)
      .header({'Access-Control-Allow-Origin': '*'})
      .type('application/json')
      .send(JSON.stringify({timestamp: new Date(), waitMs: waitMs}));
  }, waitMs)
}

function error(response, message) {
  response
      .status(400)
      .header({'Access-Control-Allow-Origin': '*'})
      .type('application/json')
      .send(JSON.stringify({"error": message}));
}

function randomInRange(min, max) {
  const minimum = toNumber(min);
  const maximum = toNumber(max);
  if (minimum > maximum) {
    throw Error('Range minimum cannot be greater than or equal to range maximum.');
  }
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
