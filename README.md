# Long Polling

How does a client get information from a server when it becomes available?

## Methods
* Polling
* Long Polling
* Websockets

### Polling
Polling is a naive attempt by the client if information is available from the server. The client will make periodic requests to the server. The server, in turn responds immediately with nothing, indicating the information is not available yet or with the desired data. Polling acts similarly to a child in the back of a car kicking the driver seat asking, "Are we there yet?" over and over, each time getting a response of "No."

### Long Polling
Long polling is similar to polling in most ways. However, it attempts to be slightly smarter. Instead of the server responding immediately when it does not have information yet, it will wait until data is available before responding. From the client's perspective, this looks like a really long request. All other aspects of long polling act as standard polling.

**Client Differences**
* Increased request timeout
* Asychronous calls

Most of the differences between polling and long polling are on the server side. Polling does not request any special server implementation. However, long polling requires the server to purposefully hold a request and continually check for information before responding. In additional, the server now has to be more aware of memory management as it may be holding a number of requests while waiting for information to become available.

**Server Differences**
* Holds request until information is available
* Memory consumption is more of an issue

Note that long polling helps simulate "push" communication where a server would typically keep a registry of clients to notify if information becomes available. Long polling helps reduce the number of requests made to the server and does not request the server to keep a registry of clients to notify. Long polling acts similarly to a child in the back of a car kicking the driver seat asking, "Are we there yet?" over and over, each time, however, the driver waits some length of time before responding, "No." or "Yes."

### Websockets
Websockets are an established, persistent connection between the client and the server. In this situation, the server is aware of the clients connected to it and can send information through this open channel when the data becomes available.

## Running
1. `npm install && npm start` (starts on port 1234)
2. Open `index.html` in a browser

Note: Some of the features like `queue` and `persistent` are buggy. You may need to restart the server if it gets stuck.
