const upperFirst = require('lodash.upperfirst')
const fieldMgmt = {
  pick: require('lodash.pick'),
  omit: require('lodash.omit')
}

class CrudRest {
  constructor (
    entityName,
    entityController,
    {
    // databaseMgmtSystem,
      nextByDefault = false,
      writable = [],
      readable = [],
      fieldMgmtStrategy = 'omit',
      methods = {}
    } = {}) {
    if (!entityName) throw new Error('CrudKoa: ConstructorError: \'entityName\' required')
    if (!entityController) throw new Error('CrudKoa: ConstructorError: \'entityController\' required')
    // if (!databaseMgmtSystem) throw new Error('CrudKoa: ConstructorError: \'databaseMgmtSystem\' required')

    this.entityName = entityName
    this.entityControllerUc = upperFirst(entityName)
    this.entityController = entityController
    // this.databaseMgmtSystem = databaseMgmtSystem

    this.methods = Object.assign(this.defaultMethods, methods)
    this.nextByDefault = nextByDefault
    this.writable = writable
    this.readable = readable
    this.fieldMgmtStrategy = fieldMgmtStrategy
  }

  get defaultMethods () {
    return {
      findById: 'findById',
      find: 'find',
      findAll: 'findAll',
      create: 'create',
      update: 'update',
      delete: 'delete'
    }
  }

  makeUrlParamMiddleware () {
    return async (id, ctx, next) => {
      const entity = await this.entityController[this.methods.findById](id)
      if (!entity) ctx.throw(404, `${this.entityControllerUc} not found`)

      ctx.state[this.entityName] = entity
      await next()
    }
  }

  makeBunch (toMake = ['find', 'findAll', 'create', 'update', 'delete']) {
    const bunch = {}

    if (toMake.includes('find')) bunch.find = this.makeFind()
    if (toMake.includes('findAll')) bunch.findAll = this.makeFindAll()
    if (toMake.includes('create')) bunch.create = this.makeCreate()
    if (toMake.includes('update')) bunch.update = this.makeUpdate()
    if (toMake.includes('delete')) bunch.delete = this.makeDelete()

    return bunch
  }

  makeFind ({
    context = true,
    withNext = this.nextByDefault,
    readable = this.readable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  } = {}) {
    return async (ctx, next) => {
      ctx.body = fieldMgmt[fieldMgmtStrategy](context ? ctx.state[this.entityName] : await this.entityController[this.methods.find](ctx.request.query), readable)
      if (withNext) next()
    }
  }

  makeFindAll ({
    withNext = this.nextByDefault,
    readable = this.readable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  } = {}) {
    return async (ctx, next) => {
      const findAllRes = await this.entityController[this.methods.findAll](ctx.request.query)

      ctx.body = findAllRes.map(o => fieldMgmt[fieldMgmtStrategy](o, readable))
      if (withNext) next()
    }
  }

  makeCreate ({
    withNext = this.nextByDefault,
    validation = () => {},
    readable = this.readable,
    writable = this.writable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  } = {}) {
    return async (ctx, next) => {
      validation(ctx.request.body)
      const createArg = fieldMgmt[fieldMgmtStrategy](ctx.request.body, writable)

      const createRes = await this.entityController[this.methods.create](createArg)

      ctx.body = fieldMgmt[fieldMgmtStrategy](createRes, readable)
      if (withNext) next()
    }
  }

  makeUpdate ({
    withNext = this.nextByDefault,
    validation = () => {},
    readable = this.readable,
    writable = this.writable,
    fieldMgmtStrategy = this.fieldMgmtStrategy
  } = {}) {
    return async (ctx, next) => {
      validation(ctx.request.body)

      const updateArg = fieldMgmt[fieldMgmtStrategy](ctx.request.body, writable)

      const updateRes = await this.entityController[this.methods.update](ctx.state[this.entityName], updateArg)

      ctx.body = fieldMgmt[fieldMgmtStrategy](updateRes, readable)
      if (withNext) next()
    }
  }

  makeDelete ({ withNext = this.nextByDefault } = {}) {
    return async (ctx, next) => {
      await this.entityController[this.methods.delete](ctx.state[this.entityName].id)
      ctx.body = { ok: true }
      if (withNext) next()
    }
  }
}

module.exports = CrudRest
