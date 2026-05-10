import { useState, useEffect } from 'react'
import {
  Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Skeleton, Box,
} from '@mui/material'
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material'
import api from '../api'

const statCards = [
  { key: 'total_income', label: 'Доходы', icon: <TrendingUp />, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'total_expense', label: 'Расходы', icon: <TrendingDown />, color: '#dc2626', bg: '#fef2f2' },
  { key: 'balance', label: 'Баланс', icon: <AccountBalanceWallet />, color: '#2563eb', bg: '#eff6ff' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((r) => setData(r.data))
  }, [])

  if (!data) return (
    <Grid container spacing={3}>
      {[1,2,3].map(i => <Grid item xs={12} md={4} key={i}><Skeleton variant="rounded" height={120} /></Grid>)}
    </Grid>
  )

  return (
    <Grid container spacing={3}>
      {statCards.map(({ key, label, icon, color, bg }) => (
        <Grid item xs={12} md={4} key={key}>
          <Card sx={{ bgcolor: bg, border: 'none', boxShadow: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color, display: 'flex' }}>{icon}</Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={700} color={key === 'balance' ? (data.balance >= 0 ? 'primary.main' : 'error.main') : color}>
                  {Number(data[key]).toLocaleString()} сум
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Доходы по категориям</Typography>
            {data.income_by_category.length === 0
              ? <Typography color="text.secondary">Нет данных</Typography>
              : data.income_by_category.map(c => (
                  <Typography key={c.name}>{c.name}: {Number(c.amount).toLocaleString()} сум</Typography>
                ))
            }
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Расходы по категориям</Typography>
            {data.expense_by_category.length === 0
              ? <Typography color="text.secondary">Нет данных</Typography>
              : data.expense_by_category.map(c => (
                  <Typography key={c.name}>{c.name}: {Number(c.amount).toLocaleString()} сум</Typography>
                ))
            }
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Последние транзакции</Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Описание</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recent_transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.date}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}
                          color={t.type === 'income' ? 'success.main' : 'error.main'}>
                          {t.type === 'income' ? 'Доход' : 'Расход'}
                        </Typography>
                      </TableCell>
                      <TableCell>{t.amount.toLocaleString()} сум</TableCell>
                      <TableCell>{t.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {data.recent_transactions.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>Нет транзакций</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
