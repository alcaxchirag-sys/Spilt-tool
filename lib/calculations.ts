// Balance calculation utilities

export interface UserBalance {
  userId: string
  username: string
  name: string
  balance: number // Positive = owed to user, Negative = user owes
}

export interface SimplifiedDebt {
  fromUserId: string
  fromUsername: string
  fromName: string
  toUserId: string
  toUsername: string
  toName: string
  amount: number
}

/**
 * Calculate net balance for each user in a group
 */
export function calculateNetBalances(
  transactions: Array<{
    paidById: string
    amount: number
    splits: Array<{
      userId: string
      amount: number
    }>
  }>,
  settlements: Array<{
    paidById: string
    receivedById: string
    amount: number
  }>,
  users: Array<{ id: string; username: string; name: string }>
): UserBalance[] {
  const balances = new Map<string, number>()

  // Initialize balances
  users.forEach((user) => {
    balances.set(user.id, 0)
  })

  // Process transactions
  transactions.forEach((transaction) => {
    const paidBy = transaction.paidById
    const totalAmount = transaction.amount

    // Add to payer's balance (they paid, so they're owed)
    balances.set(paidBy, (balances.get(paidBy) || 0) + totalAmount)

    // Subtract from each person who owes
    transaction.splits.forEach((split) => {
      balances.set(split.userId, (balances.get(split.userId) || 0) - split.amount)
    })
  })

  // Process settlements (reduce balances)
  settlements.forEach((settlement) => {
    const payer = settlement.paidById
    const receiver = settlement.receivedById
    const amount = settlement.amount

    // Payer paid, so they are owed more (or owe less)
    balances.set(payer, (balances.get(payer) || 0) + amount)
    // Receiver received, so they are owed less (or owe more)
    balances.set(receiver, (balances.get(receiver) || 0) - amount)
  })

  // Convert to array and round to 2 decimal places to avoid floating point errors
  return users.map((user) => {
    const rawBalance = balances.get(user.id) || 0
    // Use a small epsilon to treat near-zero balances as zero
    const balance = Math.abs(rawBalance) < 0.001 ? 0 : parseFloat(rawBalance.toFixed(2))

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      balance,
    }
  })
}

/**
 * Simplify debts using SplitItUp-style algorithm
 * Minimizes the number of transactions needed
 */
export function simplifyDebts(balances: UserBalance[]): SimplifiedDebt[] {
  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter((b) => b.balance > 0.001)
    .map(b => ({ ...b })) // Clone to avoid modifying original
    .sort((a, b) => b.balance - a.balance)
  const debtors = balances
    .filter((b) => b.balance < -0.001)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance)

  const simplified: SimplifiedDebt[] = []
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]

    if (creditor.balance < 0.001) {
      creditorIndex++
      continue
    }
    if (debtor.balance < 0.001) {
      debtorIndex++
      continue
    }

    const amount = Math.min(creditor.balance, debtor.balance)

    simplified.push({
      fromUserId: debtor.userId,
      fromUsername: debtor.username,
      fromName: debtor.name,
      toUserId: creditor.userId,
      toUsername: creditor.username,
      toName: creditor.name,
      amount: parseFloat(amount.toFixed(2)),
    })

    creditor.balance -= amount
    debtor.balance -= amount

    if (creditor.balance < 0.001) creditorIndex++
    if (debtor.balance < 0.001) debtorIndex++
  }

  return simplified
}

/**
 * Calculate group balance for a specific user
 */
export function calculateGroupBalance(
  userId: string,
  transactions: Array<{
    paidById: string
    amount: number
    splits: Array<{
      userId: string
      amount: number
    }>
  }>,
  settlements: Array<{
    paidById: string
    receivedById: string
    amount: number
  }>
): number {
  let balance = 0

  // Process transactions
  transactions.forEach((transaction) => {
    if (transaction.paidById === userId) {
      balance += transaction.amount
    }

    const userSplit = transaction.splits.find((s) => s.userId === userId)
    if (userSplit) {
      balance -= userSplit.amount
    }
  })

  // Process settlements
  settlements.forEach((settlement) => {
    if (settlement.paidById === userId) {
      balance += settlement.amount
    }
    if (settlement.receivedById === userId) {
      balance -= settlement.amount
    }
  })

  // Use epsilon check
  return Math.abs(balance) < 0.001 ? 0 : parseFloat(balance.toFixed(2))
}

