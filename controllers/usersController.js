const User = require('../models/User')
const asyncHandler = require('express-async-handler') //prevent from too many try catch
const bcrypt = require('bcrypt') //For password encryption

//GET all users
const getAllUsers = asyncHandler(async (req, res) => {
  //fetch users without password in json format
  const users = await User.find().select('-password').lean()
  if (!users?.length) {
    //Chaining method
    return res.status(400).json({ message: 'No users found' })
  }
  res.json(users)
})

//Create a new  users - POST
const createNewUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roles } = req.body
  //Confirm data
  if (!firstName || !lastName || !email || !password || !roles) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  //Check for duplicates
  const duplicate = await User.findOne({ email }).lean().exec()
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate user' })
  }
  //Hash password
  const hashPassword = await bcrypt.hash(password, 10) //salt rounds

  const userObject = {
    firstName,
    lastName,
    email,
    password: hashPassword,
    roles,
  }
  //Create and store new user
  const user = await User.create(userObject)

  if (user) {
    return res.status(200).json({ message: `New user ${email} created` })
  } else {
    return res.status(400).json({ message: 'Invalid user data received' })
  }
})

//Update user record - UPDATE
const updateUser = asyncHandler(async (req, res) => {
  const { id, email, roles, password } = req.body
  //Confirm data
  if (!id || !email || !roles || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: 'User not found' })
  }
  //Check for duplicates
  const duplicate = await User.findOne({ email: email }).lean().exec()
  if (duplicate && duplicate?._id.toString() != id) {
    return res.status(409).json({ message: 'Duplicate eamil' })
    user.email = email
    user.roles = roles
  }
  if (password) {
    //Hash the password
    user.password = await bcrypt.hash(password, 10) //Salt rounds
  }
  const updateUser = await user.save()
  res.json({ message: `Updated user ${email} is updated` })
})

//DELTE a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: `User id is required` })
  }
  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: 'User not found' })
  }
  const result = await user.deleteOne()
  const reply = `User with email ${result.email} has been deleted`
  response.json(reply)
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }
