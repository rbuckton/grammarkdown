---
uid: hosts
title: Host API
---

# Host API
The Host API provides the mechanism through which other Grammarkdown Service APIs can interact with the file system.

There are two kinds of hosts: Synchronous and Asynchronous.

- **Synchronous Hosts** &mdash; Can be used to interact with the file system synchronously, allowing API operations to access the file system
  in the same tick. Asynchronous API operations will use synchronous host methods if an async host is not available.

- **Asynchronous Hosts** &mdash; Can be used to interact with the file system asynchronously. API operations using an asynchronous host use
  the native ECMAScript `Promise` to signal the completion of operations. Synchronous API operations will throw when using an
  asynchronous host.

# Host Class Hierarchy

- @grammarkdown!HostBase:class
  - @grammarkdown!CoreSyncHost:class
    - @grammarkdown!NodeSyncHost:class
    - @grammarkdown!StringSyncHost:class
  - @grammarkdown!CoreAsyncHost:class
    - @grammarkdown!NodeAsyncHost:class
    - @grammarkdown!StringAsyncHost:class
