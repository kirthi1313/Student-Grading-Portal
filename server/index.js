const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const url = require('url');
const dotenv = require('dotenv');
const db = require('./queries')
const verifyToken = require('./verifyToken.js')

const port = 3000
const app = express()
app.use(cors());
dotenv.config();
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

//Middleware
app.use(express.json());


app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', verifyToken, db.getUsers)
app.get('/user', verifyToken, db.getEachUser)
app.get('/checkUser', db.checkUser)
app.get('/classes', verifyToken, db.getClasses)
app.get('/getSubjectsWithClassId', verifyToken, db.getSubjectsWithClassId)
app.get('/getPupilWithClassId', verifyToken, db.getPupilWithClassId)
app.get('/getPupilWithSubjectId', verifyToken, db.getPupilWithSubjectId)
app.get('/getTestsWithSubjectId', verifyToken, db.getTestsWithSubjectId)
app.post('/createUser', db.createUser)
app.post('/editUser', verifyToken, db.editUser)
app.post('/createClass', verifyToken, db.createClass)
app.post('/editClass', verifyToken, db.editClass)
app.get('/getTeachers', verifyToken,  db.getTeachers)
app.post('/createSubject', verifyToken, db.createSubject)
app.post('/editSubject', verifyToken, db.editSubject)
app.post('/assignPupil', verifyToken, db.assignPupil)
app.get('/getPupilInClass', verifyToken, db.getPupilInClass)
app.post('/deassignPupil', verifyToken, db.deassignPupil)
app.post('/createTest', verifyToken, db.createTest)
app.post('/editTest', verifyToken, db.editTest)
app.post('/assignPupilClass', verifyToken, db.assignPupilClass)
app.post('/deassignPupilClass', verifyToken, db.deassignPupilClass)
app.post('/createTestResult', verifyToken, db.createTestResult)
app.get('/getTestResultById', verifyToken, db.getTestResultById)
app.post('/deleteTestResult', verifyToken, db.deleteTestResult)
app.get('/getPupilTestResultById', verifyToken, db.getPupilTestResultById)
app.get('/getPupilTestResultBySubject', verifyToken, db.getPupilTestResultBySubject)
app.get('/getSubjectsByTeacherId', verifyToken, db.getSubjectsByTeacherId)
app.post('/editTestResultByPupilId', verifyToken, db.editTestResultByPupilId)
app.post('/deleteTestAndResult', verifyToken, db.deleteTestAndResult)
app.get('/getAllClassDetails', verifyToken, db.getAllClassDetails)
app.get('/getMessages', verifyToken, db.getMessages)
app.post('/createMessage', verifyToken, db.createMessage)
app.post('/markMessageAsRead', verifyToken, db.markMessageAsRead)
app.get('/getMessageUsersForPupil', verifyToken, db.getMessageUsersForPupil)
app.get('/getMessageUsersForTeacher', verifyToken, db.getMessageUsersForTeacher)
app.post('/archiveSubject', verifyToken, db.archiveSubject)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})