$(document).ready(() => {
  const $results = $('#response');
  const $multiplier = $('#multiplier');

  const $immediate = $('#status-immediate .value');
  const $random = $('#status-random .value');
  const $specific = $('#status-specific .value');
  const $range = $('#status-range .value');
  const $queue = $('#status-queue .value');

  let count = 0;
  const timeout = 50000;

  const counterInit = {
    immediate: 0,
    random: 0,
    specific: 0,
    range: 0,
    queue: 0
  };

  let counter = Object.assign({}, counterInit);

  $('#queue').on('click', () => {
    makeRequest("http://localhost:1234/queue", timeout, makeRequest);
    updateCounter($queue, counter.queue += 1);
  })

  $('#queue-push').on('click', () => {
    makeRequest("http://localhost:1234/queue/push", timeout);
  })

  $('#persistent').on('click', () => {
    makeRequest("http://localhost:1234/random", timeout, makeRequest);
    updateCounter($random, counter.random += 1);
  })

  $('#immediate').on('click', () => {
    for (let i = 0; i < getMultiplier(); i++) {
      makeRequest("http://localhost:1234/immediate", timeout);
      updateCounter($immediate, counter.immediate += 1);
    }
  })

  $('#random').on('click', () => {
    for (let i = 0; i < getMultiplier(); i++) {
      makeRequest("http://localhost:1234/random", timeout);
      updateCounter($random, counter.random += 1);
    }
  })

  $('#specific').on('click', () => {
    for (let i = 0; i < getMultiplier(); i++) {
      const value = $('#specific-value').val();
      makeRequest(`http://localhost:1234/specific/${value}`, timeout);
      updateCounter($specific, counter.specific += 1);
    }
  })

  $('#range').on('click', () => {
    for (let i = 0; i < getMultiplier(); i++) {
      const min = $('#range-min').val();
      const max = $('#range-max').val();
      makeRequest(`http://localhost:1234/range/${min}-${max}`, timeout);
      updateCounter($range, counter.range += 1);
    }
  })

  $('#clear').on('click', () => {
    $('#response .response-line').remove();
    counter = Object.assign({}, counterInit);
    updateCounter($immediate, 0);
    updateCounter($random, 0);
    updateCounter($specific, 0);
    updateCounter($range, 0);
  })

  function getMultiplier() {
    const multiplier = $multiplier.val();
    return multiplier ? multiplier : 1;
  }

  function updateCounter($element, count) {
    $element.text(count);
  }

  function responseLine(id, now, response) {
    const startTime = new Date(now);
    const endTime = new Date(response.timestamp);
    return `
      <div class="response-line">
        <div class="response-id">${id}</div>
        <div class="response-wait">${response.waitMs}</div>
        <div class="response-start-timestamp">${startTime.toLocaleString()}</div>
        <div class="response-end-timestamp">${endTime.toLocaleString()}</div>
      </div>`;
  }

  function makeRequest(url, timeout=50000, callback, delay=1000) {
    const id = (count += 1);
    const now = new Date();
    $.ajax(url, {
      timeout: timeout,
      async: true
    })
    .done(function(data) {
      $results.append(responseLine(id, now, data));
      setTimeout(() => {callback && callback(url, timeout, callback, delay)}, delay);
    }).fail(function(error) {
      $results.append(responseLine(id, now, error));
    });
  }
});