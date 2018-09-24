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

// immediate, random, specific, range, file
function defaultResponse(type, message, delay) {
  return {
    type,
    message,
    delay
  };
}

function errorResponse(type, error, delay) {
  return {
    type,
    error,
    delay
  };
}

function responseFilePath(filename) {
  return `response/${filename}`;
}

function respond(response, statusCode, body = null, delay = 0) {
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
  
function randomIntWithinRange(min, max) {
  const minimum = toNumber(min);
  const maximum = toNumber(max);
  if (minimum > maximum) {
    throw Error('Range minimum cannot be greater than or equal to range maximum.');
  }
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}

const Type = {
  IMMEDIATE: 'IMMEDIATE',
  RANDOM: 'RANDOM',
  SPECIFIC: 'SPECIFIC',
  RANGE: 'RANGE',
  FILE: 'FILE'
};

const StatusCode = {
  OK: 200,
  CREATE_OK: 201,
  BAD: 400,
  NOT_AUTHORIZED: 401,
  FORBIDDEN: 403
};

const Delay = {
  ZERO: 0,
  ONE_SECOND: 1000,
  FIVE_SECOND: 5000
}


app.get('/immediate', (request, response) => {
  respond(
    response, 
    StatusCode.OK, 
    defaultResponse(Type.IMMEDIATE, 'Immediate success!', Delay.ZERO), 
    Delay.ZERO
  );
})

app.get('/random', (request, response) => {
  const random = randomIntWithinRange(Delay.ONE_SECOND, Delay.FIVE_SECOND);
  respond(
    response, 
    StatusCode.OK,
    defaultResponse(Type.RANDOM, 'Random success!', random), 
    random
  );
})

app.get('/specific/:delay', (request, response) => {
  const {delay} = request.params;
  respond(
    response, 
    StatusCode.OK,
    defaultResponse(Type.SPECIFIC, 'Specific success!', delay), 
    delay
  );
})

app.get('/range/:from-:to', (request, response) => {
  const {from, to} = request.params;
  const random = randomIntWithinRange(from, to);
  respond(
    response, 
    StatusCode.OK,
    defaultResponse(Type.RANGE, 'Random success!', random), 
    random
  );
})

app.get('/read/:filename/status/:statusCode/delay/:delay', (request, response) => {
  const {filename, statusCode, delay} = request.params;
  const fullFilename = `${filename}.json`;
  const filePath = responseFilePath(fullFilename);
  try {
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const body = fs.readFileSync(filePath, {encoding: 'utf-8'});
      respond(response, statusCode, body, delay);
    } else {
      throw new Error(`${fullFilename} cannot be found.`);
    }
  } catch (error) {
    respond(
      response, 
      StatusCode.BAD,
      errorResponse(Type.SPECIFIC, `Could not find ${fullFilename}.`, delay),
      delay
    );
  }
})

app.get('/read/:filename/status/:statusCode', (request, response) => {
  const {filename, statusCode} = request.params;
  const fullFilename = `${filename}.json`;
  const filePath = responseFilePath(fullFilename);
  try {
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const body = fs.readFileSync(filePath, {encoding: 'utf-8'});
      respond(response, statusCode, body, Delay.ZERO);
    } else {
      throw new Error(`${filename}.json cannot be found.`);
    }
  } catch (error) {
    respond(
      response, 
      StatusCode.BAD, 
      errorResponse(Type.IMMEDIATE, `Could not find ${fullFilename}.`, Delay.ZERO),
      Delay.ZERO
    );
  }
})


  


app.get('/testing', (request, response) => {
  response.status(200).type('application/json').send({});
})

