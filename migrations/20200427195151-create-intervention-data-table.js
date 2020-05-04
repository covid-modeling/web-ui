'use strict'

const path = require('path')
const fs = require('fs')

var dbm
var type
var seed

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = function(db) {
  var filePath = path.join(
    __dirname,
    'sqls',
    '20200427195151-create-intervention-data-table-up.sql'
  )
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)
      resolve(data)
    })
  }).then(function(data) {
    return db.runSql(data)
  })
}

exports.down = function(db) {
  var filePath = path.join(
    __dirname,
    'sqls',
    '20200427195151-create-intervention-data-table-down.sql'
  )
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)
      resolve(data)
    })
  }).then(function(data) {
    return db.runSql(data)
  })
}

exports._meta = {
  version: 1
}
