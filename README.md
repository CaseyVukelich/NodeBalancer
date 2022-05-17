# NodeBalancer
Load balancer written in NodeJS

# Run
```script
node loadBalancer.js
```
# Configuration
Nodebalancer can be configured with nodebalancer.conf.
This file should include a JSON configuration object including the name of ther server (as cmd) and the port it is listening on.
Nodebalancer will load balance across these servers.

```script
[
  {
		"cmd": "server 1",
    "port": 8001
  },
	{
		"cmd": "server 2",
    "port": 8002
  }
]
```
