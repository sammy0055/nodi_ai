import amqp from 'amqplib';

let connection: amqp.ChannelModel;
let channel: amqp.Channel;

async function initRabbit() {
  if (connection && channel) return { connection, channel };

  connection = await amqp.connect('amqp://nodi_ai_admin:nodi_ai_passkey10@localhost:4011');
  channel = await connection.createChannel();

  return { connection, channel };
}

export { initRabbit };
