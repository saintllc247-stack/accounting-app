import { useState, useEffect } from 'react'
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, IconButton, Chip,
} from '@mui/material'
import { Add, Delete, Visibility, Send, Check } from '@mui/icons-material'
import api from '../api'

const statusColors = { draft: 'default', sent: 'primary', paid: 'success', cancelled: 'error' }
const statusLabels = { draft: 'Черновик', sent: 'Отправлен', paid: 'Оплачен', cancelled: 'Отменён' }

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ client_id: '', issue_date: new Date().toISOString().split('T')[0], due_date: '', notes: '', items: [{ description: '', quantity: 1, unit_price: 0 }] })

  useEffect(() => {
    api.get('/invoices').then((r) => setInvoices(r.data))
    api.get('/clients').then((r) => setClients(r.data))
  }, [])

  const loadInvoices = () => api.get('/invoices').then((r) => setInvoices(r.data))

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }] })

  const updateItem = (i, field, value) => {
    const items = [...form.items]
    items[i][field] = value
    setForm({ ...form, items })
  }

  const removeItem = (i) => {
    const items = form.items.filter((_, idx) => idx !== i)
    setForm({ ...form, items })
  }

  const total = form.items.reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0)

  const handleSave = async () => {
    const payload = { ...form, client_id: Number(form.client_id) }
    await api.post('/invoices', payload)
    setOpen(false)
    setForm({ client_id: '', issue_date: new Date().toISOString().split('T')[0], due_date: '', notes: '', items: [{ description: '', quantity: 1, unit_price: 0 }] })
    loadInvoices()
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/invoices/${id}/status`, null, { params: { status } })
    loadInvoices()
  }

  const viewInvoice = async (inv) => {
    setSelected(inv)
    setViewOpen(true)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Счета</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Выставить счёт
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№ счёта</TableCell>
                  <TableCell>Клиент</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{clients.find(c => c.id === inv.client_id)?.name || inv.client_id}</TableCell>
                    <TableCell>{inv.issue_date}</TableCell>
                    <TableCell>
                      <Chip label={statusLabels[inv.status]} color={statusColors[inv.status]} size="small" />
                    </TableCell>
                    <TableCell align="right">{inv.total_amount.toLocaleString()} сум</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => viewInvoice(inv)}><Visibility /></IconButton>
                      {inv.status === 'draft' && (
                        <>
                          <IconButton size="small" onClick={() => updateStatus(inv.id, 'sent')}><Send /></IconButton>
                          <IconButton size="small" onClick={() => updateStatus(inv.id, 'paid')}><Check /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">Нет счетов</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Новый счёт</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Клиент</InputLabel>
            <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} label="Клиент" required>
              {clients.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Дата выписки" type="date" fullWidth margin="normal" required
            value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
          <TextField label="Срок оплаты" type="date" fullWidth margin="normal" required
            value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <TextField label="Примечание" fullWidth margin="normal" multiline rows={2}
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Позиции</Typography>
          {form.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField label="Описание" size="small" sx={{ flex: 2 }}
                value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
              <TextField label="Кол-во" type="number" size="small" sx={{ width: 80 }}
                value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
              <TextField label="Цена" type="number" size="small" sx={{ width: 100 }}
                value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} />
              <Typography sx={{ minWidth: 80 }}>{(Number(item.quantity) || 0) * (Number(item.unit_price) || 0)} сум</Typography>
              <IconButton size="small" onClick={() => removeItem(i)}><Delete /></IconButton>
            </Box>
          ))}
          <Button onClick={addItem}>+ Добавить позицию</Button>
          <Typography variant="h6" sx={{ mt: 2 }}>Итого: {total.toLocaleString()} сум</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.client_id || !form.due_date}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Счёт {selected?.invoice_number}</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Typography><strong>Клиент:</strong> {clients.find(c => c.id === selected.client_id)?.name || selected.client_id}</Typography>
              <Typography><strong>Дата:</strong> {selected.issue_date} — {selected.due_date}</Typography>
              <Typography><strong>Статус:</strong> {statusLabels[selected.status]}</Typography>
              <Typography><strong>Сумма:</strong> {selected.total_amount.toLocaleString()} сум</Typography>
              {selected.notes && <Typography><strong>Примечание:</strong> {selected.notes}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
