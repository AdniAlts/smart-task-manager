const express = require('express');
const app = express();

// ... kode konfigurasi express lainnya ...

// PENTING: Import scheduler di sini agar scriptnya mulai berjalan saat server start
require('./services/scheduler'); 

app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});