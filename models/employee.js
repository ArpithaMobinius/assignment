const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employee_id: {
    type: Number,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  admin:
    {
        previous: {
            type: Number,
            default: null
        },
        next: {
            type: Number,
            default: null
        }
    },
  role: {
    type: String,
    required: true,
  },
  manager: {
    type: Number
  }
})

module.exports = mongoose.model('Employees', schema)