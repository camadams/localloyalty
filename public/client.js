'use strict';

var socket = null;

function connect() {
  var serverUrl;
  var scheme = 'ws';
  var location = document.location;

  // Use secure WebSockets if page is served over HTTPS
  if (location.protocol === 'https:') {
    scheme += 's';
  }

  // Construct WebSocket URL based on current location
  serverUrl = `${scheme}://${location.hostname}:${location.port}`;
  console.log(`Connecting to WebSocket server at ${serverUrl}`);

  // Create WebSocket connection
  socket = new WebSocket(serverUrl);

  // Handle connection open
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
    document.getElementById('connection-status').textContent = 'Connected';
    document.getElementById('connection-status').style.color = 'green';
  };

  // Handle incoming messages
  socket.onmessage = (event) => {
    try {
      // Check if the data is a Blob
      if (event.data instanceof Blob) {
        // Read the Blob as text and then parse it
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const msg = JSON.parse(reader.result);
            displayMessage(msg);
          } catch (error) {
            console.error('Error parsing Blob message as JSON:', error, reader.result);
          }
        };
        reader.readAsText(event.data);
      } else {
        // Handle as string if it's not a Blob
        const msg = JSON.parse(event.data);
        displayMessage(msg);
      }
    } catch (error) {
      console.error('Error handling message:', error, event.data);
    }
  };

  // Helper function to display messages
  function displayMessage(msg) {
    const messagesElement = document.getElementById('messages');
    const li = document.createElement('li');
    li.textContent = `${msg.name}: ${msg.message}`;
    messagesElement.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
  }

  // Handle connection close
  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
    document.getElementById('connection-status').textContent = 'Disconnected';
    document.getElementById('connection-status').style.color = 'red';
    // Try to reconnect after a delay
    setTimeout(connect, 5000);
  };

  // Handle connection errors
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    document.getElementById('connection-status').textContent = 'Error';
    document.getElementById('connection-status').style.color = 'red';
  };

  // Set up form submission handler
  document.getElementById('message-form').addEventListener('submit', sendMessage);
}

function sendMessage(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('name-input');
  const messageInput = document.getElementById('message-input');
  
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  
  if (!name) {
    alert('Please enter your name');
    return false;
  }
  
  if (!message) {
    return false;
  }
  
  // Disable name input after first message
  nameInput.disabled = true;
  nameInput.style.background = 'grey';
  nameInput.style.color = 'white';
  
  // Create and send message
  const msg = { 
    type: 'message', 
    name: name, 
    message: message 
  };
  
  socket.send(JSON.stringify(msg));
  
  // Clear message input
  messageInput.value = '';
  messageInput.focus();
  
  return false;
}

// Connect when the page loads
document.addEventListener('DOMContentLoaded', connect);
