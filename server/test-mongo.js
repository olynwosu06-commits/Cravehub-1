const mongoose = require('mongoose');

const uri = 'mongodb+srv://olynwosu06_db_user:<db_password>@cluster0.kxfbxwf.mongodb.net/?appName=Cluster0';

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Connected!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ MongoDB Error:', err.message);
        process.exit(1);
    });