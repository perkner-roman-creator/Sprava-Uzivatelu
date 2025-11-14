const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // vaše heslo, pokud nějaké máte
    database: 'projekt'
});

// Získání všech uživatelů
app.get('/api/uzivatele', (req, res) => {
    connection.query('SELECT * FROM uzivatele', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Přidání uživatele
app.post('/api/uzivatele', (req, res) => {
  const { jmeno, email, aktivni, role } = req.body;
  connection.query(
    'INSERT INTO uzivatele (jmeno, email, aktivni, role) VALUES (?, ?, ?, ?)',
    [jmeno, email, aktivni, role],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: result.insertId, jmeno, email, aktivni, role });
      }
    }
  );
});

// Úprava uživatele
app.put('/uzivatele/:id', (req, res) => {
  const { jmeno, email, aktivni } = req.body;
  connection.query(
    'UPDATE Uzivatel SET jmeno = ?, email = ?, aktivni = ? WHERE id = ?',
    [jmeno, email, aktivni, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

// Smazání uživatele
app.delete('/api/uzivatele/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM uzivatele WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(3000, () => {
    console.log('Server běží na portu 3000');
});