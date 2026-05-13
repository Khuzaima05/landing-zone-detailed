# Load Balancer

[← Previous: Security Groups](./vsi-security-groups.md) | [Index](./index.md) | [Next: Observability →](./vsi-observability.md)

## What Is a Load Balancer?

A `load balancer` sits in front of multiple servers and spreads traffic across them.

Instead of users choosing a server themselves, they connect to the load balancer.

## Why It Is Useful

A load balancer helps with:

- one stable entry point
- sharing traffic across multiple VSIs
- better availability if one server fails
- easier scaling later

## Simple Picture

```text
Users
  -> Load Balancer
      -> VSI 1
      -> VSI 2
      -> VSI 3
```

## Health Checks

A load balancer should not send traffic to a broken server.

That is why it uses `health checks`.

Simple idea:

- test whether the server responds
- if it fails, stop sending traffic there
- continue using healthy servers

## Common Example

If you have 3 web servers and one crashes:

- the load balancer notices the problem
- traffic continues to the other 2

This makes the application more reliable.

## Load Balancer Types

At a beginner level, just remember:

- some load balancers are better for web traffic like HTTP and HTTPS
- some are more general for lower-level network traffic

For many web apps, the main idea is simply "one public entry point in front of many servers."

## Good Beginner Practice

Use a load balancer when:

- more than one VSI serves the same app
- you want higher availability
- you want users to hit one stable endpoint

## Key Takeaways

- A load balancer spreads traffic across multiple VSIs.
- It gives users one stable way to reach the app.
- Health checks help avoid sending traffic to failed servers.
- It is very useful for scalable and reliable web applications.
