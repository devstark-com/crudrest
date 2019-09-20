# CrudRest

This package made to create CRUD koa middleware on a fly with just config

## Example

```js
const Router = require('koa-router')
const CrudRest = require('crudrest')

const router = new Router()

const bookCrud = new CrudRest(
  entityName = 'book',
  entityController = require('@/controllers/book'), 
  { // here shown default options
    nextByDefault = false, // call next() in each middleware
    writable = [], // array of fields allowed to write. Works with lodash omit|pick
    readable = [], // array of fields allowed to read. Works with lodash omit|pick
    fieldMgmtStrategy = 'omit', // 'omit'|'pick' - lodash functions to work with writable/readable
    methods = {
      findById: 'findById',
      find: 'find',
      findAll: 'findAll',
      create: 'create',
      update: 'update',
      delete: 'delete'
    }
  })

router
  .param('bookId', bookCrud.makeUrlParamMiddleware()) // will set ctx.state.book on requests with url param
  .post('/', bookCrud.makeCreate({ // here shown default options
    withNext = this.nextByDefault,
    validation = () => {},
    readable = this.readable,
    writable = this.writable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  }))
  .get('/', bookCrud.makeFindAll({ // here shown default options
    withNext = this.nextByDefault,
    readable = this.readable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  }))
  .get('/:bookId', bookCrud.makeFind({ // here shown default options
    context = true, // return book from ctx.state.book or pass control to 'find' method
    withNext = this.nextByDefault,
    readable = this.readable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  }))
  .put('/:bookId', bookCrud.makeUpdate({ // here shown default options
    withNext = this.nextByDefault,
    validation = () => {},
    readable = this.readable,
    writable = this.writable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  }))
  .delete('/:bookId', bookCrud.makeDelete({ withNext = this.nextByDefault }))  // here shown default options
```