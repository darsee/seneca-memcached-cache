# seneca-memcached

### Node.js Seneca Memcached module.

This module is a plugin for the [Seneca framework](http://senecajs.org). It provides a set of common caching actions (get, set, etc), backed by memcached.
It also exposes all the memcached specific actions (append, prepend, etc).

By moving cache operations into Seneca, you can change your cache implementation or business rules at a later point.
For example, you might decide to send certain kinds of keys to a different cache mechanism, such as redis.


### Support

If you're using this module, feel free to contact [@rjrodger](http://twitter.com/rjrodger) or [@darsee](http://twitter.com/darsee) on twitter if you have any questions! :)


### Quick example

This code snippet sets a value and then retrieves it. You'll need to have memcached running for this to work:

```bash
$ memcached -vv
```

```JavaScript
var seneca = require('seneca')();
seneca.use('memcached-cache');

seneca.ready(function(err) {
  seneca.act({role: 'cache', cmd: 'set', key: 'k1', val: 'v1'}, function(err) {
    seneca.act({role: 'cache', cmd: 'get', key: 'k1'}, function(err, out) {
      console.log('value = ' + out)
    });
  });
});
```

The full action argument pattern can be a bit tedious, so use a Seneca _pin_ to make things more convenient:

```JavaScript
var cache = seneca.pin({role:'cache',cmd:'*'})

cache.set({key:'k1', val:'v1'}, function(err){

  cache.get({key:'k1'}, function(err,out){
    console.log('value = '+out)
  })
})
```
## Install

```sh
npm install seneca
npm install seneca-memcached-cache
```

You'll also need [memcached](http://memcached.org/)


## Common Cache API

Seneca has a common caching API with the following actions:

   * `role:cache, cmd:set` store a value - _key_ and _val_ arguments required
   * `role:cache, cmd:get` retreive a value - _key_ argument is required
   * `role:cache, cmd:add` store a value, only if the key does not exist - _key_ and _val_ arguments required
   * `role:cache, cmd:delete` delete a value - _key_ argument is required, no error if key does not exist
   * `role:cache, cmd:incr` increment a value - _key_ and _val_ (integer) arguments required
   * `role:cache, cmd:decr` decrement a value - _key_ and _val_ (integer) arguments required

All caching plugins, including this one, implement this action API.

## Extended API

The full [memcached API](https://code.google.com/p/memcached/wiki/NewCommands) is also available. Use the action pattern
_plugin:memcached, cmd:..._ where cmd is one of 
_set, get, add, delete, incr, decr, replace, append, prepend, cas, gets, stats, flush_.

To access the underlying [memcached instance](https://github.com/3rd-Eden/node-memcached), 
use the action _plugin:memcached, cmd:native_.

The plugin also registers with the action _role:seneca, cmd:close_. This closes the memcached connection when you call the _seneca.close_ method.


### Options

You can use any of the options from the [node-memcached](https://github.com/3rd-Eden/node-memcached)
module directly as options to this plugin:

```JavaScript
seneca.use('memcached',{
  servers:[ '127.0.0.1:11211', '127.0.0.1:11212' ],
  expires: 60
})
```
## Test

```bash
cd test
mocha cache.test.js --seneca.log.print
```
