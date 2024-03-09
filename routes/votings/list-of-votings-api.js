const Joi = require('joi')
const cors = require('cors')
const express = require('express')
const db = require('./list-of-votings-f')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()
const reactJsRootUrl = process.env.ALLOWED_ORIGINS

router.use((req, res, next) => {
  // Access the 'X-User-ID' header from the request
  const userId = req.headers['x-user-id']

  // Store the User ID in req.locals for later use
  req.locals = {
    userId
  }
  next()
})

router.use(
  cors({
    origin: reactJsRootUrl ? [reactJsRootUrl] : [] // Use the origin directly
  })
)
router.use(express.json())

// Get all lists
router.get('/', async (req, res) => {
  const allLists = await db.getAllLists()
  res.send(allLists)
})

// Get part of lists by user ID (id_of_user)
router.get('/subset', async (req, res) => {
  // Access the User ID from req.locals
  const partOfLists = await db.getUserLists(req.locals.userId)
  res.send(partOfLists)
})

router.get('/template/:lov_id', async (req, res) => {
  // Access the User ID from req.locals
  const partOfLists = await db.getUserCurentList(
    req.locals.userId,
    req.params.lov_id
  )
  res.send(partOfLists[0].template)
})

// Add a new user vote
router.post('/', async (req, res) => {
  try {
    const userVoteData = {
      ...req.body,
      id_of_user: req.locals.userId,
      lov_id: uuidv4()
    }
    const { error } = validateUser(userVoteData)
    if (error) return res.status(400).send(error.details[0].message)
    const recordedList = await db.createList(userVoteData)
    res.send(recordedList)
  } catch (error) {
    console.error('Error creating user vote:', error)
  }
})

router.put('/template', async (req, res) => {
  try {
    const partOfLists = await db.getUserCurentList(
      req.locals.userId,
      req.body.lov_id
    )

    const listForUpdate = JSON.parse(partOfLists[0].template)
    listForUpdate.push({
      title: req.body.title,
      votingValue: 0,
      description: req.body.description
    })

    const updatedList = await db.updateListTemplate(
      req.locals.userId,
      req.body.lov_id,
      listForUpdate
    )

    if (updatedList) {
      return res.send('The userList with the given ID was updated.')
    } else {
      return res
        .status(404)
        .send('The userList with the given ID was not found.')
    }
  } catch (error) {
    console.error('Error updating user vote:', error)
  }
})

router.put('/template/change', async (req, res) => {
  try {
    const partOfLists = await db.getUserCurentList(
      req.locals.userId,
      req.body.lov_id
    )

    console.log(req.body.oldTitle)
    console.log(req.body.title)
    console.log(req.body.description)

    const listForUpdate = JSON.parse(partOfLists[0].template)

    const newListForUpdate = listForUpdate

    for (let i = 0; i < listForUpdate.length; i++) {
      if (listForUpdate[i].title === req.body.oldTitle) {
        newListForUpdate[i] = {
          title: req.body.title,
          votingValue: 0,
          description: req.body.description
        }
      }
    }

    const updatedList = await db.updateListTemplate(
      req.locals.userId,
      req.body.lov_id,
      newListForUpdate
    )

    if (updatedList) {
      return res.send('The userList with the given ID was updated.')
    } else {
      return res
        .status(404)
        .send('The userList with the given ID was not found.')
    }
  } catch (error) {
    console.error('Error updating user vote:', error)
  }
})

router.put('/template/delete', async (req, res) => {
  try {
    const updatedList = await db.updateListTemplate(
      req.locals.userId,
      req.body.lov_id,
      req.body.template
    )
    if (updatedList) {
      return res.send('The candidate with the given name was deleted.')
    } else {
      return res
        .status(404)
        .send('The userList with the given ID was not found.')
    }
  } catch (error) {
    console.error('Error updating user vote:', error)
  }
})

router.delete('/:lov_id', async (req, res) => {
  try {
    const userList = await db.deleteList(req.params.lov_id)
    if (userList) {
      return res.send('The userList with the given ID was deleted.')
    } else {
      return res
        .status(404)
        .send('The userList with the given ID was not found.')
    }
  } catch (error) {
    console.error('Error deleting user vote:', error)
  }
})

function validateUser(userListName) {
  const schema = {
    id_of_user: Joi.number().min(1).required(),
    lov_id: Joi.string().min(32).required(),
    name_of_voting: Joi.string().min(3).required()
  }
  return Joi.validate(userListName, schema)
}

module.exports = router
