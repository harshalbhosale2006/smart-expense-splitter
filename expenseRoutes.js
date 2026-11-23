console.log("Expense routes loaded successfully");

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// CREATE expense
router.post("/", async (req, res) => {
    try {
        const { title, amount, paidBy } = req.body;

        if (!title || !paidBy || !Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Enter a title, valid amount and payer"
            });
        }

        const expense = await Expense.create({
            title,
            amount,
            paidBy
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ all expenses
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE expense
router.put("/:id", async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
