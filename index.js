const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Employee = require('./models/employee')

mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)

const MONGODB_URI = `mongodb://192.168.2.30:27017/employee`

console.log('commecting to mongodb://192.168.2.30:27017/employee')

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
type Admin {previous:ID!, next:ID!}

  type Employee {
    name: String!
    employee_id: ID!
    dob: String!
    created: String
    updated: String
    role: String!
    admin: Admin!
    manager: String
  }

  type Query {
    employeeCount: Int!
    allEmployees: [Employee!]!
    findEmployee(name: String!): Employee
  }
  type Mutation {
    addEmployee(
      name: String!
      employee_id: ID!
      dob: String!
      role: String!
    ): Employee
  }  
`
const resolvers = {
  Query: {
    employeeCount: () => Employee.collection.countDocuments(),
    allEmployees: () => {
        return Employee.find({})
    },
    findEmployee: (root, args) => Employee.findOne({ name: args.name })
  },
  Employee: {
    admin: root => {
      return {
        previous: root.previous,
        next: root.next
      }
    }
  },
  Mutation: {
    addEmployee: async (root, args) => {
      const employee = new Employee({ ...args })

      if (employee.role === 'Admin' && employee.employee_id !== 1) {
        let prev = args.employee_id-1
        let superAdmin = await Employee.findOneAndUpdate({ employee_id: prev }, {$set:{'admin.next': employee.employee_id}})
        employee.admin ={previous: superAdmin.employee_id, next: null}
      }
      else if(employee.role === 'Employee'){
        let admin = await Employee.findOne({ 'admin.next': null })
        employee.manager = admin.employee_id
      } else
          employee.admin= {previous: null, next: null}


      try {
        await employee.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return employee
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})