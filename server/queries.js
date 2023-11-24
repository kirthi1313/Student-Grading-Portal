
var mysql = require('mysql');
const url = require('url');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function generateJwtToken(id) {
    console.log("process.env.SECRET_TOKEN", id, process.env.SECRET_TOKEN)
    const token = jwt.sign({ _id: id }, process.env.SECRET_TOKEN);
    console.log("token:::", token)
    global["token"] = token
    console.log("token:::", global.token, token)
};

var con = mysql.createConnection({
    user: 'DB_DWT_rw',
    host: 'mysql.hrz.xxxx.de',
    database: 'DB_DWTa',
    password: 'pwd',
});
var pool = mysql.createPool({
    user: 'DB_DWT_rw',
    host: 'mysql.hrz.xxx.de',
    database: 'DB_DWT',
    password: 'pwd',
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

async function hashPwd(pwd) {
    const salt = await bcrypt.genSalt(4);
    const hashedPassword = await bcrypt.hash(pwd, salt);
    console.log("hashedPassword", hashedPassword)
    return hashedPassword;
};
// users
const getUsers = (request, response) => {
    pool.getConnection(function (err, connection) {
        con.query('CALL `getUsers`();', function (err, result) {
            if (err) throw err;
            console.log(result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getEachUser = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    console.log("queryObject", queryObject)
    pool.getConnection(function (err, connection) {
        con.query('CALL `getEachUser`(?,?);', [queryObject.id,queryObject.currentPwd], async function (error, result) {
            if (error) {
                throw error
            }
            console.log(result);
            const hash = JSON.parse(JSON.stringify(result[0]))[0].pwd;
            console.log("hash", hash, queryObject.currentPwd)
            const validPass = await bcrypt.compare(queryObject.currentPwd, hash);
            console.log("validPass", validPass)
            // if (!validPass) return response.status(400).send('Password is incorrect');
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function createUser(request, response) {
    console.log("request.body", request.body)
    const { username, forename, surname, pwd, role } = request.body
    hashpwd = await hashPwd(pwd);
    console.log("password ::::", hashpwd, username, forename, surname, pwd, role)
    pool.getConnection(function (err, connection) {
        con.query('SELECT createUser(? , ? , ? , ? , ?) as createUser;', [forename, surname, username, hashpwd, role], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
            console.log("response --- ", results[0].createUser)
            generateJwtToken(results[0].createUser);
        })
        connection.release();
    });
}

async function editUser(request, response) {

    if (request.body["isEditOrDel"] && request.body["isEditOrDel"] == 'delete') {
        const { id } = request.body
        pool.getConnection(function (err, connection) {
            con.query('SELECT `deleteUser`(?) AS `deleteUser`;', [id], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results[0]}`)
            })
            connection.release();
        });

    } else {
        const { id, forename, surname, username, pwd, role } = request.body;
        pool.getConnection(function (err, connection) {
            con.query('SELECT `editUser`(?, ?, ?, ?, ?) AS `editUser`;', [id, forename, surname, username, role], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results[0]}`)
            })
            connection.release();
        });
    }

}

const checkUser = (request, response) => {

    const queryObject = url.parse(request.url, true).query;
    console.log("queryObject", queryObject)

    pool.getConnection(function (err, connection) {
        con.query('SELECT `checkUserExists`(?, ?) AS `checkUserExists`', [queryObject.userName, queryObject.pwd], (error, results) => {
            if (error) {
                throw error
            }
            console.log("results ", results[0].checkUserExists)
            response.status(200).json(results[0].checkUserExists)
            generateJwtToken(results[0].checkUserExists);
            connection.release();
        })
    });
}

// classes

const getClasses = (request, response) => {
    pool.getConnection(function (err, connection) {
        con.query('CALL `getClasses`();', function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function createClass(request, response) {
    const { name } = request.body
    pool.getConnection(function (err, connection) {
        con.query('CALL createClass(? );', [name], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Class added with ID: ${results[0]}`)
        })
        connection.release();
    });
}

async function editClass(request, response) {
    if (request.body["isEditOrDel"] && request.body["isEditOrDel"] == 'delete') {
        const { id } = request.body
        pool.getConnection(function (err, connection) {
            con.query('SELECT `deleteClass`(?) AS `deleteClass`;', [id], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Class added with ID: ${results[0]}`)
            })
            connection.release();
        });

    } else {
        const { id, name } = request.body;
        pool.getConnection(function (err, connection) {
            con.query('SELECT `editClass`(?, ?) AS `editClass`;', [id, name], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Class added with ID: ${results[0]}`)
            })
            connection.release();
        });
    }
}

const getSubjectsWithClassId = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getSubjects`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getPupilWithClassId = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getPupil`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getPupilWithSubjectId = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getPupilWithSubjectId`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0]);
        });
        connection.release();
    });
}

const getTestsWithSubjectId = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getTestsWithSubjectId`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getPupilInClass = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getPupilInClass`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}
const getSubjectsByTeacherId = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getSubjectsByTeacherId`(?);', [queryObject.teacherId], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getTeachers = (request, response) => {
    pool.getConnection(function (err, connection) {
        con.query('CALL `getTeachers`();', function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getAllClassDetails = (request, response) => {
    pool.getConnection(function (err, connection) {
        con.query('CALL `getAllClassDetails`();', function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function createSubject(request, response) {
    console.log("request.body", request.body)
    const { name, teacherId, classId, isArchived } = request.body
    pool.getConnection(function (err, connection) {
        con.query('CALL `createSubject`(? , ?, ? , ?);', [name, teacherId, classId, isArchived], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function editSubject(request, response) {
    if (request.body["isEditOrDel"] && request.body["isEditOrDel"] == 'delete') {
        const { id } = request.body
        pool.getConnection(function (err, connection) {
            con.query('SELECT `deleteSubject`(?) AS `deleteSubject`;', [id], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Class added with ID: ${results[0]}`)
            })
            connection.release();
        });

    } else {
        const { id, name, teacherId } = request.body;
        console.log("teacherId", id, name, teacherId)
        pool.getConnection(function (err, connection) {
            con.query('SELECT `editSubject`(?, ?, ?) AS `editSubject`;', [id, name, teacherId], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Class added with ID: ${results[0]}`)
            })
            connection.release();
        });
    }
}

async function assignPupil(request, response) {
    console.log("request.body", request.body)
    const { pupilId, subjectId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `assignPupil`(?, ?) AS `assignPupil`;', [pupilId, subjectId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function deassignPupil(request, response) {
    console.log("request.body", request.body)
    const { pupilId, subjectId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `deassignPupil`(?, ?) AS `deassignPupil`;', [pupilId, subjectId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function createTest(request, response) {
    console.log("request.body", request.body)
    const { subjectId, name, testDate } = request.body
    pool.getConnection(function (err, connection) {
        con.query('CALL `createTest`(?, ?, ?);', [subjectId, name, testDate], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function editTestResultByPupilId(request, response) {
    console.log("request.body", request.body)
    const { id, uid, grade } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT  `editTestResultByPupilId`(?, ?, ?) as editTestResultByPupilId;', [uid, id, grade], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function editTest(request, response) {
    console.log("request.body", request.body)
    if (request.body["isEditOrDel"] && request.body["isEditOrDel"] == 'delete') {
        const { id } = request.body
        pool.getConnection(function (err, connection) {
            con.query('SELECT `deleteTest`(?) as `deleteTest`;', [id], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results.insertId}`)
            })
            connection.release();
        });

    } else {
        const { id, name, testDate } = request.body
        pool.getConnection(function (err, connection) {
            con.query('SELECT `editTest`(?, ?, ?) as `editTest`;', [id, name, testDate], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results.insertId}`)
            })
            connection.release();
        });
    }
}

async function assignPupilClass(request, response) {
    console.log("request.body", request.body)
    const { pupilId, classId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `assignPupilClass`(?, ?) AS `assignPupilClass`;', [pupilId, classId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function deassignPupilClass(request, response) {
    console.log("request.body", request.body)
    const { pupilId, classId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `deassignPupilClass`(?, ?) AS `deassignPupilClass`;', [pupilId, classId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

const getTestResultById = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getTestResultById`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getPupilTestResultById = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        console.log("queryObject", queryObject.id)
        con.query('CALL `pupilTestResultById`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getPupilTestResultBySubject = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        console.log("queryObject", queryObject.pupilId, queryObject.subjectId)
        con.query('CALL `pupilTestResultBySubject`(?,?);', [queryObject.pupilId, queryObject.subjectId], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function createTestResult(request, response) {
    console.log("request.body", request.body)
    const { TestName, PupilUserName, Grade } = request.body
    pool.getConnection(function (err, connection) {
        con.query('CALL createTestResult(?, ?, ?);', [TestName, PupilUserName, Grade], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}


async function deleteTestResult(request, response) {
    console.log("request.body", request.body)
    const { pupilId, testId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `deleteTestResult`(?, ?) as `deleteTestResult`;', [pupilId, testId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function deleteTestAndResult(request, response) {
    console.log("request.body", request.body)
    const { testId } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT `deleteTestAndResult`(?) as `deleteTestAndResult`;', [testId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

const getMessages = (request, response) => {
    const token = global.token;
    request.header = {
        "auth-token": token
    }
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getMessages`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function createMessage(request, response) {
    console.log("request.body", request.body)
    const { sender, receiver, msg } = request.body
    pool.getConnection(function (err, connection) {
        con.query('CALL createMessage(?, ?, ?);', [sender, receiver, msg], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

async function markMessageAsRead(request, response) {
    console.log("request.body", request.body)
    const { id } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT  `markMessageAsRead`(?) as markMessageAsRead;', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results.insertId}`)
        })
        connection.release();
    });
}

const getMessageUsersForPupil = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getMessageUsersForPupil`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

const getMessageUsersForTeacher = (request, response) => {
    const queryObject = url.parse(request.url, true).query;
    pool.getConnection(function (err, connection) {
        con.query('CALL `getMessageUsersForTeacher`(?);', [queryObject.id], function (err, result) {
            if (err) throw err;
            console.log("result:::", result);
            response.status(200).json(result[0])
        });
        connection.release();
    });
}

async function archiveSubject(request, response) {
    console.log("request.body", request.body)
    const { id } = request.body
    pool.getConnection(function (err, connection) {
        con.query('SELECT  `archiveSubject`(?) as archiveSubject;', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`User added with ID: ${results}`)
        })
        connection.release();
    });
}

module.exports = {
    getUsers,
    getEachUser,
    createUser,
    editUser,
    checkUser,
    getClasses,
    createClass,
    editClass,
    getSubjectsWithClassId,
    getPupilWithClassId,
    getPupilWithSubjectId,
    getTestsWithSubjectId,
    getTeachers,
    createSubject,
    editSubject,
    assignPupil,
    getPupilInClass,
    deassignPupil,
    createTest,
    editTest,
    assignPupilClass,
    deassignPupilClass,
    createTestResult,
    getTestResultById,
    deleteTestResult,
    getPupilTestResultById,
    getPupilTestResultBySubject,
    getSubjectsByTeacherId,
    editTestResultByPupilId,
    deleteTestAndResult,
    getAllClassDetails,
    getMessages,
    getMessageUsersForPupil,
    createMessage,
    markMessageAsRead,
    getMessageUsersForTeacher,
    archiveSubject
}
