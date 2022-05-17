/* 
 * NodeBalancer
 *
 * Simple Round Robin loadbalancer written in Node.js
 */

const fs = require('fs');
const net = require('net');
const process = require('process')

let conf

// Read in configuration and start
function main () {
  fs.readFile('./nodebalancer.conf', (err, configuration) => {
    if (err) return console.error('An error occured while reading the configuration file:', err)

    conf = JSON.parse(configuration)
    startServer(conf)
  });
}

// Start the load balancer
function startServer (conf) {
  new ManagerNode(conf)
}

// The manager node is the class that represents the balancer.
// It spawns workers to interface with each server it manages.
class ManagerNode {
  constructor (conf) {
    this.conf = conf
    this.workers = []
    this.position = 0 // Position in the round-robin queue.

    this.startServer()
    this.spawnWorkers()
  }

  // Create load balancer server and connect to each server being managed
  startServer () {
    this.server = net.createServer(connection => {
      connection.on('data', data => {
        this.workers[this.position++].send(data.toString(), connection)

        if (this.position >= this.totalWorkers) this.position = 0
      })
    })

    this.server.on('error', error => {
      if (error.code === 'EADDRINUSE') {
        console.log('Error: port in use.')
        server.close()
        process.exit(1)
      }
    })

    this.server.on('close', () => console.log('closing'))

    this.server.listen(8012, () => {})
  }

  // Create a worker for each server being balanced across.
  spawnWorkers () {
    let port = 1337
    this.conf.forEach(proc => {
      const worker = new WorkerNode(proc)

      worker.openSockChannel(port++)

      this.workers.push(worker)
    })

    this.totalWorkers = this.workers.length
  }
}

// The WorkerNode class represents one of the servers being balanced
class WorkerNode {
  constructor (config) {
    Object.assign(this, config)
  }

  // Open socket to server
  openSockChannel (commPort) {
    // Connect to the server being managed.
    this.sock = net.createConnection(this.port)

    this.sock.on('connect', () => {
      this.sock.setEncoding('utf8') // defaults to buffer
    })

    this.sock.on('data', data => {
      if (this.connection) {
        // Write to socket
        this.connection.write(data)
        this.connection.pipe(this.connection)
      }
    })

    this.sock.on('error', console.error)

    this.sock.on('close', () => {  
      // Websockets need to be re-opened after they close.
      this.openSockChannel()
    })
  }

  // Send data over socket
  send (query, connection) {
    this.connection = connection

    this.sock.write(query)
    this.sock.resume()
  }
}

main()

