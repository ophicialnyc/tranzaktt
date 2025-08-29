import { sql } from "../config/db.js"

export async function getTransactionsByUserId(req, res) {
     
    // users will like to get all transactions by user id
    // this is a GET request to fetch transactions for a specific user
    
    try {
        const { userid } = req.params;
        const transactions = await sql`SELECT * FROM Transactions WHERE user_id = ${userid}`;
        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error fetching transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export async function createTransactionsByUserId(req, res) {
    
        // users will like to create a transaction
        // like sending a new amount, category, title and others
        try {
            const { user_id, title, amount, category } = req.body;
            if(!title  || !category || !user_id || amount === undefined) {
                return res.status(400).json({ message: "All fields are required" });
            }
    
           const transaction = await sql `INSERT INTO Transactions (user_id, title, amount, category, created_at, updated_at)
            VALUES (${user_id}, ${title}, ${amount}, ${category}, CURRENT_DATE, CURRENT_DATE) RETURNING *`;
            console.log(transaction);
            if (transaction.length === 0) {
                return res.status(400).json({ message: "Transaction creation failed" });
            } else {
                console.log("Transaction created successfully:", transaction[0]);
                res.status(201).json(transaction[0]); // Return the created transaction
            }
        } catch (error) {
            console.log("Error creating this transaction", error);
            return res.status(500).json({ error: "Internal server error" });
        }
};

export async function deleteTransactionById(req, res) {

    
    try {
        const { id } = req.params;
        if (isNaN(id) || !id) {
            return res.status(400).json({ message: "Invalid Transaction ID" });
        }
        const result = await sql`DELETE FROM Transactions WHERE id = ${id}`;
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.log("Error deleting transaction:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export async function getTransactionSummaryById(req, res) {
    
    // users will like to get all transactions
    // this is a GET request to fetch all transactions
    try {
        const { userid } = req.params;
        const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM Transactions
        WHERE user_id = ${userid}
        `

        const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income
        FROM Transactions
        WHERE user_id = ${userid} AND amount > 0
        `
        const expenseResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS expense
        FROM Transactions
        WHERE user_id = ${userid} AND amount < 0
        `
        res.status(200).json
        ;

    

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        });
    } catch (error) {
        console.log("Error fetching the summary:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}