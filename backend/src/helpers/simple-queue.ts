// const userQueues = new Map();

// async function handleIncomingMessage(userId, message) {
//   if (!userQueues.has(userId)) {
//     userQueues.set(userId, { messages: [], processing: false });
//   }

//   const queue = userQueues.get(userId);
//   queue.messages.push(message);

//   // If already processing, just store the message
//   if (queue.processing) return;

//   queue.processing = true;

//   // Wait briefly to collect more messages (2s window)
//   await new Promise(r => setTimeout(r, 2000));

//   // Grab all messages to process and clear the list
//   const toProcess = [...queue.messages];
//   queue.messages.length = 0; // ✅ clears array without reassigning

//   try {
//     await processMessages(userId, toProcess);
//   } catch (err) {
//     console.error("Error processing message:", err);
//   }

//   // After processing, check if any new messages came in while we were busy
//   if (queue.messages.length > 0) {
//     // recursively process next batch
//     queue.processing = false;
//     handleIncomingMessage(userId, null); // triggers next batch
//     return;
//   }

//   // ✅ Cleanup: no pending messages, remove user from memory
//   queue.processing = false;
//   userQueues.delete(userId);
// }