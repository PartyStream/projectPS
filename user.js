function createUser(response,userId,password)
{
    // TODO Create user in DB
    console.log('Creating a user');
}

function readUser(response,userId)
{
    // TODO Read a user record
    console.log('Reading user: ' + userId);
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("User id: " + userId);
    response.end();
}

function updateUser(response,userId)
{
    // TODO update a user record
    console.log('Updating a user');
}

function deleteUser(response,userId)
{
    // TODO delete a user record
    console.log('Deleting a user');
}

exports.createUser = createUser;
exports.readUser   = readUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;