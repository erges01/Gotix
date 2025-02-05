const bcrypt = require('bcryptjs');

const inputPassword = "password123";
const storedHash = "$2a$12$wF7leAnvnNXYT9bAAz1XFeVPYlUYKq87vZ12SZOYy.OS6Yrzl4lH2"; 

bcrypt.compare(inputPassword, storedHash).then(result => {
    console.log("Password comparison result:", result);
});
