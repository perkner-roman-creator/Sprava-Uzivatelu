import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, Box, TextField, Button,
  Checkbox, FormControlLabel, List, ListItem, ListItemText, IconButton, Pagination,
  Avatar, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import './App.css';

function App() {
  const [uzivatele, setUzivatele] = useState([]);
  const [form, setForm] = useState({ jmeno: '', email: '', aktivni: true, role: 'user' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialog, setDetailDialog] = useState({ open: false, user: null });
  const usersPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:3000/api/uzivatele')
      .then(res => res.json())
      .then(data => setUzivatele(data));
  }, []);

  const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.jmeno || !form.email) {
      setError('Vyplňte jméno i email.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Zadejte platný email.');
      return;
    }
    setError('');
    const url = editId
      ? `http://localhost:3000/api/uzivatele/${editId}`
      : 'http://localhost:3000/api/uzivatele';
    const method = editId ? 'PUT' : 'POST';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(() => {
        setForm({ jmeno: '', email: '', aktivni: true, role: 'user' });
        setEditId(null);
        return fetch('http://localhost:3000/api/uzivatele')
          .then(res => res.json())
          .then(data => setUzivatele(data));
      });
  };

  const handleDelete = id => {
    fetch(`http://localhost:3000/api/uzivatele/${id}`, { method: 'DELETE' })
      .then(() => {
        return fetch('http://localhost:3000/api/uzivatele')
          .then(res => res.json())
          .then(data => setUzivatele(data));
      });
  };

  const handleEdit = u => {
    setForm({ jmeno: u.jmeno, email: u.email, aktivni: u.aktivni, role: u.role });
    setEditId(u.id);
  };

  const handleDetail = u => {
    setDetailDialog({ open: true, user: u });
  };

  const filtered = uzivatele.filter(u =>
    u.jmeno.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginated = filtered.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  return (
    <Box sx={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Správa uživatelů
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            {editId ? 'Upravit uživatele' : 'Přidat uživatele'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            <TextField
              label="Jméno"
              value={form.jmeno}
              onChange={e => setForm({ ...form, jmeno: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.aktivni}
                  onChange={e => setForm({ ...form, aktivni: e.target.checked })}
                />
              }
              label="Aktivní"
            />
            <Select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="user">Uživatel</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {editId ? 'Uložit změny' : 'Přidat uživatele'}
              </Button>
              {editId && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => { setEditId(null); setForm({ jmeno: '', email: '', aktivni: true, role: 'user' }); }}
                  fullWidth
                >
                  Zrušit editaci
                </Button>
              )}
            </Box>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
          <TextField
            label="Vyhledat uživatele"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
          />
          <List>
            {paginated.map(u => (
              <ListItem
                key={u.id}
                alignItems="flex-start"
                secondaryAction={
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', mt: 4, mr: 3 }}>
                    <IconButton color="info" onClick={() => handleDetail(u)} sx={{ p: 0.2 }}>
                      <InfoIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEdit(u)} sx={{ p: 0.2 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(u.id)} sx={{ p: 0.2 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Avatar sx={{ mr: 2, mt: 0.5 }} />
                <ListItemText
                  primary={
                    <span style={{ fontWeight: 500 }}>
                      {u.jmeno} ({u.email})
                    </span>
                  }
                  secondary={
                    <>
                      {u.aktivni ? 'Aktivní' : 'Neaktivní'}
                      <br />
                      Role: {u.role === 'admin' ? 'Admin' : 'Uživatel'}
                    </>
                  }
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => setCurrentPage(value)}
              color="primary"
            />
          </Box>
        </Paper>
        {/* Detail uživatele v dialogu */}
        <Dialog
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, user: null })}
        >
          <DialogTitle>Detail uživatele</DialogTitle>
          <DialogContent>
            {detailDialog.user && (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
                <Typography><strong>Jméno:</strong> {detailDialog.user.jmeno}</Typography>
                <Typography><strong>Email:</strong> {detailDialog.user.email}</Typography>
                <Typography><strong>Aktivní:</strong> {detailDialog.user.aktivni ? 'Ano' : 'Ne'}</Typography>
                <Typography><strong>Role:</strong> {detailDialog.user.role === 'admin' ? 'Admin' : 'Uživatel'}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open: false, user: null })}>Zavřít</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;
