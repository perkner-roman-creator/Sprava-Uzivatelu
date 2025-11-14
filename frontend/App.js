import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [uzivatele, setUzivatele] = useState([]);
  const [form, setForm] = useState({ jmeno: '', email: '', aktivni: true, obrazek: null, role: 'user' });
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState('all');
  const [toast, setToast] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('light');
  const themeStyles = theme === 'light'
    ? { background: '#fff', color: '#222' }
    : { background: '#222', color: '#fff' };

  const handleLogin = e => {
    e.preventDefault();
    // Zde by byla kontrola proti backendu
    setLoggedIn(true);
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };
  const usersPerPage = 5;

  // Načtení uživatelů
  useEffect(() => {
    fetch('/api/uzivatele')
      .then(res => res.json())
      .then(data => setUzivatele(data));
  }, []);

  // Validace emailu
  const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Odeslání formuláře (přidání/úprava)
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
    if (editId) {
      fetch(`/api/uzivatele/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
        .then(() => {
          window.location.reload();
          showToast('Operace byla úspěšná');
        });
    } else {
      fetch('/api/uzivatele', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
        .then(() => {
          window.location.reload();
          showToast('Operace byla úspěšná');
        });
    }
    logAction('Uživatel upraven/přidán');
  };

  // Smazání uživatele
  const handleDelete = id => {
    fetch(`/api/uzivatele/${id}`, { method: 'DELETE' })
      .then(() => {
        window.location.reload();
        showToast('Operace byla úspěšná');
      });
    logAction('Uživatel smazán');
  };

  // Editace uživatele
  const handleEdit = u => {
    setForm({ jmeno: u.jmeno, email: u.email, aktivni: u.aktivni, role: u.role });
    setEditId(u.id);
    setDetail(null);
  };

  // Zobrazení detailu uživatele
  const handleDetail = u => {
    setDetail(u);
    setEditId(null);
  };

  // Vyhledávání
  const filtered = uzivatele.filter(u =>
    (filterActive === 'all' ||
      (filterActive === 'active' && u.aktivni) ||
      (filterActive === 'inactive' && !u.aktivni)) &&
    (u.jmeno.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Výpočet stránkování
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginated = filtered.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  const exportCSV = () => {
    const rows = [
      ['ID', 'Jméno', 'Email', 'Aktivní'],
      ...uzivatele.map(u => [u.id, u.jmeno, u.email, u.aktivni ? 'Ano' : 'Ne'])
    ];
    const csvContent = rows.map(e => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uzivatele.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, obrazek: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const logAction = action => setHistory(h => [...h, { action, time: new Date().toLocaleString() }]);

  return (
    <div>
      <h1>Správa uživatelů</h1>
      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
          <input type="password" placeholder="Heslo" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
          <button type="submit">Přihlásit se</button>
        </form>
      ) : (
        <>
          <input
            type="text"
            placeholder="Vyhledat uživatele"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={filterActive} onChange={e => setFilterActive(e.target.value)}>
            <option value="all">Všichni</option>
            <option value="active">Pouze aktivní</option>
            <option value="inactive">Pouze neaktivní</option>
          </select>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Jméno"
              value={form.jmeno}
              onChange={e => setForm({ ...form, jmeno: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <label>
              Aktivní:
              <input
                type="checkbox"
                checked={form.aktivni}
                onChange={e => setForm({ ...form, aktivni: e.target.checked })}
              />
            </label>
            <input type="file" accept="image/*" onChange={handleImage} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="user">Uživatel</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">{editId ? 'Uložit změny' : 'Přidat uživatele'}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ jmeno: '', email: '', aktivni: true }); }}>Zrušit editaci</button>}
          </form>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <ul>
            {paginated.map(u => (
              <li key={u.id}>
                <span onClick={() => handleDetail(u)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                  {u.jmeno} ({u.email}) {u.aktivni ? '✅' : '❌'}
                </span>
                <button onClick={() => handleEdit(u)}>Editovat</button>
                <button onClick={() => handleDelete(u.id)}>Smazat</button>
              </li>
            ))}
          </ul>
          <div>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{ fontWeight: currentPage === i + 1 ? 'bold' : 'normal' }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {detail && (
            <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
              <h2>Detail uživatele</h2>
              <p><strong>ID:</strong> {detail.id}</p>
              <p><strong>Jméno:</strong> {detail.jmeno}</p>
              <p><strong>Email:</strong> {detail.email}</p>
              <p><strong>Aktivní:</strong> {detail.aktivni ? 'Ano' : 'Ne'}</p>
              <button onClick={() => setDetail(null)}>Zavřít detail</button>
            </div>
          )}
          <button onClick={exportCSV}>Exportovat do CSV</button>
          {toast && <div style={{ position: 'fixed', top: 10, right: 10, background: '#4caf50', color: '#fff', padding: '10px' }}>{toast}</div>}
          {form.obrazek && <img src={form.obrazek} alt="Profil" width={50} />}
          <h2>Historie akcí</h2>
          <ul>
            {history.map((h, i) => (
              <li key={i}>{h.time}: {h.action}</li>
            ))}
          </ul>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Přepnout {theme === 'light' ? 'tmavý' : 'světlý'} režim
          </button>
          <div style={themeStyles}>
            {/* Zbytek aplikace */}
          </div>
        </>
      )}
    </div>
  );
}

export default App;