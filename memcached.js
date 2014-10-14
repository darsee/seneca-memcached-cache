/* Copyright (c) 2012-2014 Richard Rodger */
"use strict";


var _         = require('underscore')
var Memcached = require('memcached')


module.exports = function( options, register ) {
  var seneca = this

  options   = seneca.util.deepextend({
    expires:3600,
    servers:['127.0.0.1:11211'],
    // other options as per memcached module
  }, options)



  var cmds = {}
  var name = 'memcached-cache'
  var role = 'cache'

  var mi


  function setter(kind) {
    return function(args,cb) {
      var key = args.key
      var val = args.val
      var expires = args.expires || options.expires
      mi[kind](key,val,expires,function(err,out){
        cb(err,key)
      })
    }
  }


  cmds.set     = setter('set')
  cmds.add     = setter('add')
  cmds.replace = setter('replace')
  cmds.cas     = setter('cas')
  cmds.append  = setter('append')
  cmds.prepend = setter('prepend')


  function bykey(kind) {
    return function(args,cb) {
      var key = args.key
      mi[kind](key,function(err,out){
        if (kind === 'delete') return cb(err,key)
        cb(err,out)
      })
    }
  }

  cmds.get = bykey('get')
  cmds.gets = bykey('gets')
  cmds.delete = bykey('delete')


  function incrdecr(kind) {
    return function(args,cb) {
      var key = args.key
      var val = args.val
      mi[kind](key,val,function(err,out){
        cb(err,out)
      })
    }
  }

  cmds.incr = incrdecr('increment')
  cmds.decr = incrdecr('decrement')


  function noargs(kind) {
    return function(args,cb) {
      mi[kind](cb)
    }
  }

  cmds.flush = noargs('flush')
  cmds.stats = noargs('stats')

  cmds.close = function(args,done){
    var closer = this
    try {
      mi.end()
    }
    catch(e) {
      closer.log.error('close-error',e)
    }
    this.prior(args,done)
  }




  // cache role
  seneca.add({role:role,cmd:'set'},cmds.set)
  seneca.add({role:role,cmd:'get'},cmds.get)
  seneca.add({role:role,cmd:'add'},cmds.add)
  seneca.add({role:role,cmd:'delete'},cmds.delete)
  seneca.add({role:role,cmd:'incr'},cmds.incr)
  seneca.add({role:role,cmd:'decr'},cmds.decr)

  seneca.add({role:role,get:'native'},function(args,done){
    done(null,mi)
  })


  // connection needs to be closed
  seneca.add({role:'seneca',cmd:'close'},cmds.close)

  // memcached
  seneca.add({plugin:name,cmd:'set'},cmds.set)
  seneca.add({plugin:name,cmd:'get'},cmds.get)
  seneca.add({plugin:name,cmd:'add'},cmds.add)
  seneca.add({plugin:name,cmd:'delete'},cmds.delete)
  seneca.add({plugin:name,cmd:'incr'},cmds.incr)
  seneca.add({plugin:name,cmd:'decr'},cmds.decr)
  seneca.add({plugin:name,cmd:'replace'},cmds.replace)
  seneca.add({plugin:name,cmd:'append'},cmds.append)
  seneca.add({plugin:name,cmd:'prepend'},cmds.prepend)
  seneca.add({plugin:name,cmd:'cas'},cmds.cas)
  seneca.add({plugin:name,cmd:'gets'},cmds.gets)
  seneca.add({plugin:name,cmd:'stats'},cmds.stats)
  seneca.add({plugin:name,cmd:'flush'},cmds.flush)




  seneca.add({init:name},function(args,done){
    mi = new Memcached(options.servers,options)
    done()
  })


  register(null,{
    name:name
  })
}
